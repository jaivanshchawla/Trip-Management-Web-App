import { NextResponse, NextRequest } from 'next/server';
import mongoose, { model, models } from 'mongoose';
import { connectToDatabase, supplierSchema } from '@/utils/schema';
import { ISupplier } from '@/utils/interface';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '@/utils/auth';
import { recentActivity } from '@/helpers/recentActivity';

const Supplier = models.Supplier || model('Supplier', supplierSchema);

export async function GET(req: Request) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    await connectToDatabase()

    const suppliers = await Supplier.aggregate([
      {
        $match: { user_id: user }
      },
      {
        $lookup: {
          from: 'trips',
          localField: 'supplier_id',
          foreignField: 'supplier',
          as: 'trips'
        }
      },
      {
        // Add a new field `filteredTrips` containing only trips with status 1
        $addFields: {
          filteredTrips: {
            $filter: {
              input: '$trips',
              as: 'trip',
              cond: { $lt: ['$$trip.status', 1] }
            }
          }
        }
      },
      {
        // Add another field `tripCount` which is the size of the `filteredTrips` array
        $addFields: {
          tripCount: { $size: '$filteredTrips' }
        }
      },
      {
        // Lookup the supplier account to fetch the totalAmount from SupplierAccount collection
        $lookup: {
          from: 'supplieraccounts', // Collection name
          localField: 'supplier_id',
          foreignField: 'supplier_id',
          as: 'accounts'
        }
      },
      {
        // Add a new field to sum the totalAmount from SupplierAccount collection
        $addFields: {
          totalAccountBalance: {
            $sum: '$accounts.amount'
          }
        }
      },
      {
        // Add a field to sum up the total truck hire cost from filteredTrips
        $addFields: {
          totalTruckHireCost: {
            $sum: '$trips.truckHireCost'
          }
        }
      },
      {
        // Calculate the balance (totalAccountBalance - totalTruckHireCost)
        $addFields: {
          balance: { $subtract: ['$totalAccountBalance', '$totalTruckHireCost'] }
        }
      },
      {
        $project: {
          supplier_id: 1,
          totalAccountBalance: 1,
          totalTruckHireCost: 1,
          balance: 1,
          tripCount: 1,
          name : 1,
          contactNumber : 1
        }
      }
    ]);
    
    return NextResponse.json({ suppliers }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    await connectToDatabase

    const data = await req.json();

    // Basic validation
    if (!data.name) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }


    const phoneRegex = /^[789]\d{9}$/;
    if (data.contactNumber != '' && !phoneRegex.test(data.contactNumber)) {
      return NextResponse.json({ message: 'Invalid phone number' }, { status: 400 });
    }


    const newSupplier: ISupplier = new Supplier({
      user_id: user,
      supplier_id: 'suppllier' + uuidv4(),
      name: data.name,
      contactNumber: data.contactNumber,
      tripCount: 0,
      balance: 0,
    });

    await Promise.all([newSupplier.save(), recentActivity('Added New Supplier', newSupplier, user)]);
    return NextResponse.json({ message: 'Saved Successfully', data: newSupplier }, { status: 200 });

  } catch (error: any) {
    console.error('Error saving party:', error);

    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation Error', details: error.message }, { status: 400 });
    } else if (error.name === 'MongoError' && error.code === 11000) {
      return NextResponse.json({ message: 'Duplicate Key Error', details: error.message }, { status: 409 });
    } else {
      return NextResponse.json({ message: 'Internal Server Error', details: error.message }, { status: 500 });
    }
  }
}
