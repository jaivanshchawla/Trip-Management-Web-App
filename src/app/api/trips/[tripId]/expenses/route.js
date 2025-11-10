import { fetchBalanceBack } from "@/helpers/fetchTripBalance";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, tripChargesSchema, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// Initialize the TripExpense model
const TripCharges = models.TripCharges || model('TripCharges', tripChargesSchema);

export async function GET(req: Request, { params }: { params: { tripId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  // Connect to the database
  await connectToDatabase();

  // Extract the tripId from the request params
  const { tripId } = params;

  try {
    // Fetch the trip expenses from the database
    const charges = await TripCharges.find({ user_id: user, trip_id: tripId }).lean();

    // Return a success response with the charges
    return NextResponse.json({ status: 200, charges });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error fetching trip expenses:", error);
    return NextResponse.json({ status: 500, error: "Failed to fetch trip expenses" });
  }
}


// Define the POST handler
export async function POST(req: Request, { params }: { params: { tripId: string } }) {
  // Connect to the database
  await connectToDatabase();

  // Extract the tripId from the request params
  const { tripId } = params;

  try {
    const { user, error } = await verifyToken(req);
    if (error) {
      return NextResponse.json({ error });
    }
    // Parse the request body as JSON
    const data = await req.json();

    // Create a new instance of TripExpense with the parsed data and tripId
    if(data.amount === 0 || !data.expenseType || !data.date){
      throw new Error('Please fill in the required feilds')
    }
    const newCharge = new TripCharges({
      ...data,
      trip_id: tripId,
      user_id: user
    });

    const Trip = models.Trip || model('Trip', tripSchema)
    const trip = await Trip.findOne({user_id : user, trip_id : tripId})

    const charges = await TripCharges.find({ user_id: user, trip_id: trip.trip_id })
    const pending = await fetchBalanceBack(trip, charges)
    if (pending < 0) {
      return NextResponse.json({ message: "Balance going negative", status: 400 })
    }


    // Save the new charge to the database
    await newCharge.save();

    // Return a success response with the new charge
    return NextResponse.json({ status: 200, newCharge });

  } catch (error: any) {
    // Handle any errors that occur during the process
    console.error("Error creating new trip expense:", error);
    return NextResponse.json({ status: 500, error:error.message });
  }
}

export async function PATCH(req: Request, { params }: { params: { tripId: string } }) {
  await connectToDatabase();
  const edited = await req.json();

  try {
    const { user, error } = await verifyToken(req);
    if (error) {
      return NextResponse.json({ error });
    }
    const expense = await TripCharges.findOneAndUpdate({user_id : user, _id : edited._id}, edited, { new: true });
    if (!expense) {
      return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
    }
    return NextResponse.json({ status: 200, charge: expense });
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred while updating the expense' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { tripId: string } }) {
  await connectToDatabase();
  const { id } = await req.json()

  try {
    const { user, error } = await verifyToken(req);
    if (error) {
      return NextResponse.json({ error });
    }
    const expense = await TripCharges.findOneAndDelete({user_id : user, _id : id});
    if (!expense) {
      return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
    }
    return NextResponse.json({ status: 200, charge: expense });
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred while deleting the expense' }, { status: 500 });
  }
}
