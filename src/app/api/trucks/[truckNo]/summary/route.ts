import { verifyToken } from "@/utils/auth";
import { connectToDatabase, ExpenseSchema, tripSchema, tripChargesSchema } from "@/utils/schema";
import { model, models, Schema } from "mongoose";
import { NextResponse } from "next/server";

// Define models if not already defined
const Trip = models.Trip || model('Trip', tripSchema);
const Expense = models.Expense || model('Expense', ExpenseSchema);
const TripCharge = models.TripCharge || model('TripCharge', tripChargesSchema);

export async function GET(req: Request, {params} : {params : {truckNo : string}}) {
  const { user, error } = await verifyToken(req);
  if (!user || error) {
    return NextResponse.json({ error, status: 401 });
  }

  try {
    await connectToDatabase();
    const {truckNo} = params
    
    // Fetch all trips for the user
    const trips = await Trip.find({ user_id: user , truck : truckNo});

    // Calculate tripRevenue
    let tripRevenue = 0;
    for (const trip of trips) {
      tripRevenue += trip.amount;
      
      // Fetch trip charges for the current trip
      const tripCharges = await TripCharge.find({user_id : user, trip_id: trip.trip_id });
      
      // Calculate the charges
      for (const charge of tripCharges) {
        if (charge.partyBill) {
          tripRevenue += charge.amount;
        } else {
          tripRevenue -= charge.amount;
        }
      }
    }

    // Fetch all expenses for the user
    const expenses = await Expense.find({ user_id: user, truck: truckNo }).select('amount');

    // Calculate truckExpense
    let truckExpense = 0;
    for (const expense of expenses) {
        truckExpense += expense.amount;
    }

    return NextResponse.json({ truckExpense, tripRevenue }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 });
  }
}
