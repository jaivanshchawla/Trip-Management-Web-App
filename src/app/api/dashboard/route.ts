import { model, models } from 'mongoose'
import { tripSchema, ExpenseSchema, connectToDatabase, RecentActivitiesSchema } from '@/utils/schema';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';

const Trip = models.Trip || model('Trip', tripSchema)
const Expense = models.Expense || model('Expense', ExpenseSchema)
const RecentActivities = models.RecentActivities || model('RecentActivities',RecentActivitiesSchema)

async function getTripsByMonth(userId: string) {
  // Determine the current financial year
  const now = new Date();
  let startOfFinancialYear = new Date(now.getFullYear(), 3, 1); // April 1st
  let endOfFinancialYear = new Date(now.getFullYear() + 1, 2, 31, 23, 59, 59, 999); // March 31st next year

  if (now.getMonth() < 3) {
      startOfFinancialYear.setFullYear(now.getFullYear() - 1);
      endOfFinancialYear.setFullYear(now.getFullYear());
  }

  // Extract the start year and end year of the financial year
  const startYear = startOfFinancialYear.getFullYear();
  const endYear = endOfFinancialYear.getFullYear();

  // Perform the aggregation
  const result = await Trip.aggregate([
      {
          $match: {
              user_id: userId,
              startDate: { $gte: startOfFinancialYear, $lte: endOfFinancialYear },
          },
      },
      {
          $group: {
              _id: { 
                  month: { $month: "$startDate" }, // Extract month
                  year: { $year: "$startDate" },   // Extract year
              },
              count: { $sum: 1 }, // Count trips for each month
          },
      },
      {
          $sort: { "_id.year": 1, "_id.month": 1 }, // Sort by year and month
      },
      {
          $facet: {
              months: [
                  {
                      $project: {
                          month: "$_id.month",
                          year: "$_id.year",
                          count: 1,
                      },
                  },
              ],
              allMonths: [
                  {
                      $project: {
                          month: { $literal: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
                      },
                  },
                  { $unwind: "$month" },
                  {
                      $project: {
                          month: 1,
                          year: {
                              $cond: [
                                  { $lte: ["$month", 3] }, // If the month is Jan-Mar
                                  endYear,
                                  startYear,
                              ],
                          },
                          count: { $literal: 0 }, // Default count = 0 for missing months
                      },
                  },
              ],
          },
      },
      {
          $project: {
              combined: {
                  $setUnion: ["$months", "$allMonths"], // Combine actual and default months
              },
          },
      },
      {
          $unwind: "$combined", // Flatten combined array
      },
      {
          $replaceRoot: { newRoot: "$combined" }, // Restructure output
      },
      {
          $group: {
              _id: { month: "$month", year: "$year" },
              count: { $max: "$count" }, // Take the actual count if exists, otherwise 0
          },
      },
      {
          $sort: { "_id.year": 1, "_id.month": 1 }, // Sort by year and month
      },
      {
          $project: {
              month: {
                  $arrayElemAt: [
                      [null, "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                      "$_id.month",
                  ],
              },
              year: "$_id.year",
              count: 1,
          },
      },
      {
          $project: {
              monthYear: { $concat: ["$month", " ", { $toString: "$year" }] }, // Concatenate month and year
              count: 1,
          },
      },
  ]);

  return result;
}



async function getAccounts(userId : string){
    const accountsReceivable : any = await Trip.aggregate([
        {
          $match: { user_id: userId } // Filter by user ID
        },
        {
          $lookup: {
            from: 'tripcharges',
            localField: 'trip_id',
            foreignField: 'trip_id',
            as: 'tripExpenses'
          }
        },
        {
          $lookup: {
            from: 'partypayments',
            localField: 'trip_id',
            foreignField: 'trip_id',
            as: 'tripAccounts'
          }
        },
        {
          $addFields: {
            balance: {
              $let: {
                vars: {
                  accountBalance: {
                    $sum: {
                      $map: {
                        input: '$tripAccounts',
                        as: 'account',
                        in: '$$account.amount'
                      }
                    }
                  },
                  chargeToBill: {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: '$tripExpenses',
                            as: 'expense',
                            cond: { $eq: ['$$expense.partyBill', true] }
                          }
                        },
                        as: 'filteredExpense',
                        in: '$$filteredExpense.amount'
                      }
                    }
                  },
                  chargeNotToBill: {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: '$tripExpenses',
                            as: 'expense',
                            cond: { $eq: ['$$expense.partyBill', false] }
                          }
                        },
                        as: 'filteredExpense',
                        in: '$$filteredExpense.amount'
                      }
                    }
                  }
                },
                in: {
                  $subtract: [
                    { $add: ['$amount', '$$chargeToBill'] },  // Add trip amount and chargeToBill
                    { $add: ['$$accountBalance', '$$chargeNotToBill'] }  // Subtract accountBalance and chargeNotToBill
                  ]
                }
              }
            }
          }
        },
        {
          $group: {
            _id: null, // Group all trips together
            totalReceivable: { $sum: '$balance' } // Sum up all balances
          }
        },
        {
          $project: {
            _id: 0, // Exclude the _id field
            totalReceivable: 1 // Include only the totalReceivable field
          }
        }
      ]);

      return accountsReceivable['totalReceivable'];
}
async function categorizeExpenses(userId: string) {
    // Define the financial year
    const now = new Date();
    const startOfFinancialYear = new Date(now.getFullYear(), 3, 1); // April 1st
    const endOfFinancialYear = new Date(now.getFullYear() + 1, 2, 31, 23, 59, 59, 999); // March 31st next year

    if (now.getMonth() < 3) {
        startOfFinancialYear.setFullYear(now.getFullYear() - 1);
        endOfFinancialYear.setFullYear(now.getFullYear());
    }

    // Perform aggregation
    const result = await Expense.aggregate([
        {
            $match: {
                user_id: userId,
                date: { $gte: startOfFinancialYear, $lte: endOfFinancialYear }
            }
        },
        {
            $addFields: {
                category: {
                    $cond: [
                        { $ne: ["$trip_id", ""] }, // Trip Expense
                        "Trip",
                        {
                            $cond: [
                                { $and: [{ $eq: ["$trip_id", ""] }, { $ne: ["$truck", ""] }] }, // Truck Expense
                                "Truck",
                                "Office" // Office Expense
                            ]
                        }
                    ]
                }
            }
        },
        {
            $group: {
                _id: "$category",
                totalExpenses: { $sum: 1 },
                totalAmount: { $sum: "$amount" }
            }
        },
        {
            $sort: { _id: 1 } // Optional: Sort categories alphabetically
        }
    ]);

    return result;
}
async function calculateMonthlyProfit(user: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
    const result = await Trip.aggregate([
      {
        $match: {
          user_id: user,
          startDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $lookup: {
          from: 'trucks',
          localField: 'truck',
          foreignField: 'truckNo',
          as: 'truckDetails',
        },
      },
      { $unwind: '$truckDetails' },
      {
        $lookup: {
          from: 'tripcharges',
          localField: 'trip_id',
          foreignField: 'trip_id',
          as: 'charges',
        },
      },
      { $unwind: { path: '$charges', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null, // Combine all ownership types into a single result
          totalFreight: { $sum: '$amount' }, // Total freight
          totalCharges: {
            $sum: {
              $cond: [
                { $eq: ['$charges.partyBill', true] },
                { $ifNull: ['$charges.amount', 0] },
                0,
              ],
            },
          },
          totalDeductions: {
            $sum: {
              $cond: [
                { $eq: ['$charges.partyBill', false] },
                { $ifNull: ['$charges.amount', 0] },
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'expenses',
          pipeline: [
            {
              $match: {
                user_id: user,
                date: { $gte: startOfMonth, $lte: endOfMonth },
              },
            },
            { $group: { _id: null, totalExpense: { $sum: '$amount' } } },
          ],
          as: 'expensesData',
        },
      },
      { $unwind: { path: '$expensesData', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          totalProfit: {
            $subtract: [
              { $add: ['$totalFreight', '$totalCharges'] }, // Freight + party charges
              { $add: ['$totalDeductions', { $ifNull: ['$expensesData.totalExpense', 0] }] }, // Deductions + expenses
            ],
          },
        },
      },
    ]);
  
    return result[0]?.totalProfit || 0; // Return total profit or 0 if no data
  }
  

export async function GET(req: Request) {
    try {
        const { user, error } = await verifyToken(req)
        if (!user || error) {
            return NextResponse.json({ error: 'unauthorized', status: 401 })
        }
        await connectToDatabase()
        const [expenses, trips, accountsReceivable, profit, recentActivities] = await Promise.all([categorizeExpenses(user), getTripsByMonth(user),getAccounts(user), calculateMonthlyProfit(user), RecentActivities.findOne({user_id : user}).select('activities').lean() ])
        return NextResponse.json({ expenses, trips, accountsReceivable, profit,recentActivities, status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error, status: 500 })
    }
}
