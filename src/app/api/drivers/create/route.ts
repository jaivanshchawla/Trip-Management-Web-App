import { NextResponse } from 'next/server';
import mongoose, { model, models } from 'mongoose';
import { connectToDatabase, driverSchema } from '@/utils/schema';
import { IDriver } from '@/utils/interface';
import { verifyToken } from '@/utils/auth';


const Driver = models.Driver || model('Driver', driverSchema);



export async function GET(req : Request) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    await connectToDatabase()

    const drivers = await Driver.find({user_id : user}).select(['name', 'driver_id','status','contactNumber']).lean().exec();
    return NextResponse.json({ drivers });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}