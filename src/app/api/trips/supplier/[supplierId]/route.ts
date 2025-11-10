import { verifyToken } from "@/utils/auth";
import { connectToDatabase, supplierSchema, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Supplier = models.Supplier || model('Supplier', supplierSchema)
const Trip = models.Trip || model('Trip', tripSchema)

export async function GET(req: Request, params: { params: { supplierId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { supplierId } = params.params;

  try {
    // Connect to the MongoDB database
    await connectToDatabase();

    // Find the supplier based on supplierId
    const trips = await Trip.aggregate([
      { $match: {user_id : user, supplier : supplierId} },  // Filter trips based on user_id and optional statuses
      {
        $lookup: {
          from: 'parties',  // Join with the Party collection
          localField: 'party',
          foreignField: 'party_id',
          as: 'partyDetails'
        }
      },
      { $unwind: '$partyDetails' },  // Unwind partyDetails array
      {
        $lookup: {
          from: 'tripcharges',  // Join with the TripExpense collection
          localField: 'trip_id',
          foreignField: 'trip_id',
          as: 'tripExpenses'
        }
      },
      {
        $addFields: {
          // Calculate the final balance based on the fetchBalance logic
          balance: {
            $let: {
              vars: {
                accountBalance: {
                  $sum: {
                    $map: {
                      input: '$accounts',
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
          },
          // Include the party name from the joined partyDetails
          partyName: '$partyDetails.name'
        }
      },  // Sort by startDate in descending order
      // Exclude unnecessary fields including accountBalance, chargeToBill, and chargeNotToBill
      {
        $project: {
          'party': 1,
          'partyName': 1,
          'trip_id': 1,
          'startDate': 1,
          'truck': 1,
          'truckHireCost': 1,
          'status': 1, // Include the calculated balance
          'partyBalance': 1,
          'route' : 1 ,
          'balance' : 1// Include party balance if required
          // Exclude fields you don't need
        }
      }
    ]);
    // Handle case where supplier is not found
    if (!trips) {
      return NextResponse.json({ message: "No trips found" }, { status: 404 });
    }

    // Return the supplier details
    return NextResponse.json({ trips: trips }, { status: 200 });

  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}