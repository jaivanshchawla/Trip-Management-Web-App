import { verifyToken } from "@/utils/auth";
import { connectToDatabase, ExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

// Define the Expense model
const Expense = models.Expense || model('Expense', ExpenseSchema);

export async function GET(req: Request) {
    try {
        const { user, error } = await verifyToken(req);
        if (error) {
            return NextResponse.json({ error }, { status: 401 }); // Unauthorized
        }

        await connectToDatabase()
        // Get the current date
        const currentDate = new Date();

        // Calculate the start and end dates of the financial year
        const currentYear = currentDate.getFullYear();
        const financialYearStart = new Date(currentDate.getMonth() >= 3 ? currentYear : currentYear - 1, 3, 1); // April 1st
        const financialYearEnd = new Date(currentDate.getMonth() >= 3 ? currentYear + 1 : currentYear, 2, 31, 23, 59, 59); // March 31st

        const expensesSummary = await Expense.aggregate([
            {
                $match: {
                    user_id: user, // Filter by user
                    date: { $gte: financialYearStart, $lte: financialYearEnd } // Filter by current financial year
                }
            },
            {
                $facet: {
                    tripExpense: [
                        {
                            $match: {
                                trip_id: { $exists: true, $ne: "" } // trip_id exists and is not empty
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalAmount: { $sum: "$amount" }
                            }
                        },
                        {
                            $project: {
                                totalAmount: { $ifNull: ["$totalAmount", 0] } // Handle empty result
                            }
                        }
                    ],
                    truckExpense: [
                        {
                            $match: {
                                $and: [
                                    {
                                        $or: [
                                            { trip_id: { $exists: false } }, // trip_id does not exist
                                            { trip_id: { $eq: '' } }         // or trip_id is an empty string
                                        ]
                                    },
                                    { truck: { $exists: true, $ne: '' } } // truck exists and is not an empty string
                                ]
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalAmount: { $sum: "$amount" }
                            }
                        },
                        {
                            $project: {
                                totalAmount: { $ifNull: ["$totalAmount", 0] } // Handle empty result
                            }
                        }
                    ],

                    officeExpense: [
                        {
                            $match: {
                                $and: [
                                    {
                                        $or: [
                                            { trip_id: { $exists: false } },
                                            { trip_id: { $eq: '' } }
                                        ]
                                    },
                                    {
                                        $or: [
                                            { truck: { $exists: false } },
                                            { truck: { $eq: '' } }
                                        ]
                                    }
                                ]
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalAmount: { $sum: "$amount" }
                            }
                        },
                        {
                            $project: {
                                totalAmount: { $ifNull: ["$totalAmount", 0] } // Handle empty result
                            }
                        }
                    ]
                }
            }
        ]);

        // Process the result
        const expenses = {
            totalTruckExpense: expensesSummary[0].truckExpense[0]?.totalAmount || 0,
            totalTripExpense: expensesSummary[0].tripExpense[0]?.totalAmount || 0,
            totalOfficeExpense: expensesSummary[0].officeExpense[0]?.totalAmount || 0
        };




        return NextResponse.json({ expenses, status: 200 });
    } catch (err: any) {
        console.error('Error fetching expenses:', err);
        return NextResponse.json({ message: 'Internal Server Error', status: 500 });
    }
}
