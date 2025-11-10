import { verifyToken } from "@/utils/auth";
import { connectToDatabase, driverSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Driver = models.Driver || model('Driver', driverSchema)

export async function GET(req: Request, { params }: { params: { driverId: string } }) {
    const { user, error } = await verifyToken(req);
    if (error) {
      return NextResponse.json({ error });
    }
    const { driverId } = params;
  
    try {
      await connectToDatabase();
  
      const driver = await Driver.findOne({user_id : user, driver_id : driverId}).select('name');
  
      if (!driver) {
        return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
      }
  
      return NextResponse.json(driver, { status: 200 });
    } catch (err: any) {
      console.log(err);
      return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
    }
  }