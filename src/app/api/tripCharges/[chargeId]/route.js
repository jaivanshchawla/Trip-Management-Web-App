import { recentActivity } from "@/helpers/recentActivity";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, tripChargesSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const TripCharges = models.TripCharges || model('TripCharges', tripChargesSchema)

export async function DELETE(req: Request, { params }: { params: { chargeId: string } }) {
    await connectToDatabase();
    const {chargeId} = params
  
    try {
      const { user, error } = await verifyToken(req);
      if (!user || error) {
        return NextResponse.json({ error });
      }
      const expense = await TripCharges.findByIdAndDelete(chargeId);
      await recentActivity('Deleted Trip Charge', expense, user)
      if (!expense) {
        return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
      }
      return NextResponse.json({ status: 200, charge: expense });
    } catch (error) {
      return NextResponse.json({ message: 'An error occurred while deleting the expense' }, { status: 500 });
    }
  }