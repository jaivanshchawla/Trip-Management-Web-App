import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase, tripSchema, partySchema } from '@/utils/schema';
import { verifyToken } from '@/utils/auth';

const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
const Party = mongoose.models.Party || mongoose.model('Party', partySchema);

export async function GET(request: Request, { params }: { params: { partyId: string } }) {
  const { user, error } = await verifyToken(request);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const { partyId } = params;
    const trips = await Trip.aggregate([
      { 
        $match: { 
          user_id: user, 
          party: partyId 
        } 
      }, // Filter trips based on user_id and partyId
      {
        $lookup: {
          from: 'parties', // Join with the Party collection
          localField: 'party',
          foreignField: 'party_id',
          as: 'partyDetails'
        }
      },
      { $unwind: '$partyDetails' }, // Unwind partyDetails array
      {
        $lookup: {
          from: 'tripcharges', // Join with the TripExpense collection
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
                    $filter: {
                      input: '$tripExpenses',
                      as: 'expense',
                      cond: { $eq: ['$$expense.partyBill', true] }
                    }
                  }
                },
                chargeNotToBill: {
                  $sum: {
                    $filter: {
                      input: '$tripExpenses',
                      as: 'expense',
                      cond: { $eq: ['$$expense.partyBill', false] }
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
          revenue: {
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
                    }
                },
                in: { $add: ['$amount', '$$accountBalance'] }  // Add trip amount and account balance
            }
        },
          // Include the party name from the joined partyDetails
          partyName: '$partyDetails.name'
        }
      },
      { 
        $project: {
          trip_id: 1,
          startDate: 1,
          truck: 1,
          route: 1,
          truckHireCost: 1,
          status: 1,
          balance: 1, // Include the calculated balance
          partyName: 1,
          LR : 1, // Include the party name,
          revenue : 1
        } 
      }
    ]);
    

    return NextResponse.json({ trips });
  } catch (err) {
    console.error('Error fetching trips:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
