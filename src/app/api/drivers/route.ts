import { NextResponse } from 'next/server';
import { model, models } from 'mongoose';
import { connectToDatabase, driverSchema } from '@/utils/schema';
import { IDriver } from '@/utils/interface';
import { verifyToken } from '@/utils/auth';
import { v4 as uuidv4 } from 'uuid'
import { recentActivity } from '@/helpers/recentActivity';


const Driver = models.Driver || model('Driver', driverSchema);



export async function GET(req: Request) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    await connectToDatabase()

    const drivers = await Driver.aggregate([
      {
        $match: { user_id: user }  // Find drivers for the specific user
      },
      {
        $lookup: {
          from: 'trips',  // Lookup trips to aggregate accounts related to each driver
          let: { driverId: "$driver_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$driver", "$$driverId"] } } },  // Match trips by driverId
            { $unwind: "$accounts" },  // Unwind accounts array
            { $match: { "accounts.receivedByDriver": true } },  // Filter only accounts received by driver
            {
              $group: {
                _id: null,
                totalTripAccounts: { $sum: "$accounts.amount" }  // Sum of account amounts from trips where receivedByDriver is true
              }
            }
          ],
          as: 'tripAccounts'
        }
      },
      {
        $lookup: {
          from: 'expenses',  // Lookup expenses related to each driver
          let: { driverId: "$driver_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$driver", "$$driverId"] } } },  // Match expenses by driverId
            {
              $group: {
                _id: null,
                totalExpenses: { $sum: "$amount" }  // Sum of expense amounts
              }
            }
          ],
          as: 'driverExpenses'
        }
      },
      {
        $addFields: {
          totalTripAccounts: { $ifNull: [{ $arrayElemAt: ["$tripAccounts.totalTripAccounts", 0] }, 0] },  // Default to 0 if no trip accounts
          totalExpenses: { $ifNull: [{ $arrayElemAt: ["$driverExpenses.totalExpenses", 0] }, 0] },  // Default to 0 if no expenses
          driverAccountsBalance: {
            $reduce: {
              input: "$accounts",  // Driver's own accounts (got - gave)
              initialValue: 0,
              in: { $add: ["$$value", { $subtract: ["$$this.got", "$$this.gave"] }] }
            }
          }
        }
      },
      {
        $addFields: {
          balance: {
            $subtract: [
              { $add: ["$totalTripAccounts", "$driverAccountsBalance"] },  // Sum trip accounts and driver accounts
              "$totalExpenses"  // Subtract total expenses
            ]
          }
        }
      },
      {
        $project: {
          driver_id: 1,
          name: 1,  // Project necessary fields (e.g., driver name)
          balance: 1 ,
          status : 1,
          contactNumber : 1, // Include the calculated balance field
          licenseNo : 1,
          aadharNo : 1,
          lastJoiningDate : 1,
        }
      }
    ]);


    return NextResponse.json({ drivers });
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
    await connectToDatabase()

    const data = await req.json();



    // Phone number validation (10 digits starting with 7, 8, or 9)
    const phoneRegex = /^[6789]\d{9}$/;
    if (data.contactNumber != '' && !phoneRegex.test(data.contactNumber)) {
      return NextResponse.json({ message: 'Invalid phone number' }, { status: 400 });
    }


    const newDriver: IDriver = new Driver({
      user_id: user,
      driver_id: 'driver' + uuidv4(),
      name: data.name,
      contactNumber: data.contactNumber,
      balance: data.balance,
      status: data.status
    });

    const [savedDriver,recent] = await Promise.all([ newDriver.save(),recentActivity('Added New Driver', newDriver, user)]);
    return NextResponse.json({ message: 'Saved Successfully', data: savedDriver, status: 200 });

  } catch (error: any) {
    console.error('Error saving Driver:', error);

    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation Error', details: error.message }, { status: 400 });
    } else if (error.name === 'MongoError' && error.code === 11000) {
      return NextResponse.json({ message: 'Duplicate Key Error', details: error.message }, { status: 409 });
    } else {
      return NextResponse.json({ message: 'Internal Server Error', details: error.message }, { status: 500 });
    }
  }
}
