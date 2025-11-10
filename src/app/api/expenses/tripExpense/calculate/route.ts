import { verifyToken } from "@/utils/auth";
import { connectToDatabase, tripChargesSchema, ExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const TripCharges = models.TripCharges || model('TripCharges', tripChargesSchema);
const Expense = models.Expense || model('Expense', ExpenseSchema);

export async function GET(req: Request) {
    const { user, error } = await verifyToken(req);
    if (error) {
        return NextResponse.json({ error }, { status: 401 }); // Unauthorized
    }

    const url = new URL(req.url);
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');

    await connectToDatabase();

    if (!month || !year) {
        const tripExpense = await Expense.find({ user_id: user }).lean();
        // Calculate total expense
        const totalExpense = tripExpense.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        return NextResponse.json({ tripExpense, totalExpense, status: 200 });
    }

    const monthMap: { [key: string]: number } = {
        January: 0,
        February: 1,
        March: 2,
        April: 3,
        May: 4,
        June: 5,
        July: 6,
        August: 7,
        September: 8,
        October: 9,
        November: 10,
        December: 11
    };

    const monthNumber = monthMap[month];
    if (monthNumber === undefined) {
        return NextResponse.json({ error: 'Invalid month name', status: 400 });
    }

    const startDate = new Date(parseInt(year), monthNumber, 1);
    const endDate = new Date(parseInt(year), monthNumber + 1, 1);

    try {
        const [tripExpense, truckExpense] = await Promise.all([
            TripCharges.find({
                user_id: user,
                date: {
                    $gte: startDate,
                    $lt: endDate
                },
                partyBill: false
            }).lean(),
            Expense.find({
                user_id: user,
                date: {
                    $gte: startDate,
                    $lt: endDate
                },
                trip_id: { $exists: true, $ne: '' }
            }).lean()
        ]);

        // Combine expenses and calculate the total
        const combinedExpenses = [...tripExpense, ...truckExpense];
        const totalExpense = combinedExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

        return NextResponse.json({ totalExpense, status: 200 });
    } catch (err: any) {
        console.error('Error fetching expenses:', err);
        return NextResponse.json({ message: 'Internal Server Error', status: 500 });
    }
}
