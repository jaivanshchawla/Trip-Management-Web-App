import { verifyToken } from "@/utils/auth";
import { connectToDatabase, driverSchema, ExpenseSchema, tripSchema } from "@/utils/schema";
import { models, model } from "mongoose";
import { NextResponse } from "next/server";

const Trip = models.Trip || model('Trip', tripSchema);
const Expense = models.Expense || model('Expense', ExpenseSchema);
const Driver = models.Driver || model('Driver', driverSchema);

export async function GET(req: Request, { params }: { params: { driverId: string } }) {
    try {
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error });
        }
        const { driverId } = params;
        await connectToDatabase();

        // Aggregate trips with accounts
        const accounts = await Trip.aggregate([
            { $match: { user_id: user, driver: driverId } },
            { $unwind: "$accounts" },
            { $sort: { "dates.0": -1 } },
            {
                $project: {
                    _id: 0,
                    account: "$accounts",
                    tripId: "$trip_id"
                }
            },
            { $replaceRoot: { newRoot: { $mergeObjects: ["$account", { tripId: "$tripId" }] } } },
            { $match: { receivedByDriver: true } } // Optional: filter accounts received by driver
        ]);

        // Sum the amounts from expenses
        const expenseSum = await Expense.aggregate([
            { $match: { user_id: user, driver: driverId } },
            { $group: { _id: null, totalExpense: { $sum: "$amount" } } }
        ]);

        // Find the driver and calculate driver accounts balance
        const driver = await Driver.findOne({ user_id: user, driver_id: driverId }).select('accounts')

        let totalExpense = expenseSum.length > 0 ? expenseSum[0].totalExpense : 0;

        let totalAccounts = accounts.reduce((sum, account) => sum + account.amount, 0);

        let totalDriverAccounts = driver.accounts.reduce((sum : any, account : any) => sum + account.got - account.gave, 0);

        const total = totalDriverAccounts + totalAccounts - totalExpense;

        return NextResponse.json({ total });

    } catch (error : any) {
        return NextResponse.json({ error: error.message, status: 500 });
    }
}
