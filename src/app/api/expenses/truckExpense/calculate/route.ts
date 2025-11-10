import { verifyToken } from "@/utils/auth";
import { connectToDatabase, ExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

// Define the Expense model
const Expense = models.Expense || model('Expense', ExpenseSchema);

export async function GET(req: Request) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error }, { status: 401 }); // Unauthorized
  }

  const url = new URL(req.url);
  const month = url.searchParams.get('month');
  const year = url.searchParams.get('year');

  if (!month || !year) {
    await connectToDatabase();
    const expenses = await Expense.find({
      user_id: user, $or: [
        { trip_id: { $exists: false } },
        { trip_id: { $eq: '' } }
      ]
    }).lean();

    // Calculate the total expense
    const totalExpense = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    return NextResponse.json({ expenses, totalExpense, status: 200 });
  }

  // Map of month names to month numbers (0-indexed)
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

  const startDate = new Date(Number(year), monthNumber, 1);
  const endDate = new Date(Number(year), monthNumber + 1, 1); // Next month's start date

  try {
    await connectToDatabase();
    const expenses = await Expense.find({
      user_id: user,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
      $or: [
        { trip_id: { $exists: false } },
        { trip_id: { $eq: '' } }
      ]
    }).lean();

    // Calculate the total expense
    const totalExpense = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    return NextResponse.json({ totalExpense, status: 200 });
  } catch (err: any) {
    console.error('Error fetching expenses:', err);
    return NextResponse.json({ message: 'Internal Server Error', status: 500 });
  }
}
