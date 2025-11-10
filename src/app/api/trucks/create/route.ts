import { NextResponse } from 'next/server';
import { model, models } from 'mongoose';
import { connectToDatabase, truckSchema } from '@/utils/schema';
import { verifyToken } from '@/utils/auth';

const Truck = models.Truck || model('Truck', truckSchema);

export async function GET(req: Request) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    await connectToDatabase()

    const trucks = await Truck.find({ user_id: user }).select(['truckNo','status','supplier','driver_id']).exec();
    return NextResponse.json({ trucks });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
