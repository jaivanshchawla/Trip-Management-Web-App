import { verifyToken } from "@/utils/auth";
import { connectToDatabase, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Trip = models.Trip || model('Trip', tripSchema)

export async function GET(req : Request, {params} : {params : {supplierId : string}}) {
    const { user, error } = await verifyToken(req);
    if (error) {
      return NextResponse.json({ error });
    }
    const {supplierId} = params
    try {
      await connectToDatabase();
  
      const trips = await Trip.find({user_id : user,supplier : supplierId}).select(['trip_id','route','truckHireCost','startDate','truck']).lean().sort({ 'dates.0': -1 }).exec();
      return NextResponse.json({ trips });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  