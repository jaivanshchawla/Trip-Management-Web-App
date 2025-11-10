import { verifyToken } from "@/utils/auth";
import { connectToDatabase, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Trip = models.Trip || model('Trip', tripSchema)

export async function GET(req: Request, { params }: { params: { truckNo: string } }) {
    const { user, error } = await verifyToken(req);
    if (error) {
        return NextResponse.json({ error });
    }
    try {
        const { truckNo } = params;
        await connectToDatabase();

        const trips = await Trip.aggregate([
            { $match: { user_id: user, truck: truckNo } },  // Filter trips based on user_id and truckNo
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
                    // Corrected revenue calculation: Add the trip amount and account balance
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
            },  // Sort by startDate in descending order
            // Exclude unnecessary fields
            {
                $project: {
                    startDate: 1,
                    LR: 1,
                    partyName: 1,
                    route: 1,
                    status: 1,
                    balance: 1,
                    revenue: 1
                }
            }
        ]);

        return NextResponse.json({ trips });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}