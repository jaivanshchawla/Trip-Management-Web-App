import { NextResponse } from 'next/server';
import mongoose, { model, models } from 'mongoose';
import { driverSchema, tripChargesSchema, tripSchema, truckSchema } from '@/utils/schema';
import { connectToDatabase } from '@/utils/schema';
import { ITrip } from '@/utils/interface';
import { v4 as uuidv4 } from 'uuid'
import { partySchema } from '@/utils/schema';
import { verifyToken } from '@/utils/auth';
import { uploadFileToS3 } from '@/helpers/fileOperation';
import { recentActivity } from '@/helpers/recentActivity';

const Trip = models.Trip || model('Trip', tripSchema);
const Driver = models.Driver || model('Driver', driverSchema)
const Truck = models.Truck || model('Truck', truckSchema)
const TripCharges = models.TripCharges || model('TripCharges', tripChargesSchema)
// Assuming you have this schema defined

export async function GET(req: Request) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }

  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const status = url.searchParams.get('status')

    // Prepare query with user_id and optional statuses filter
    const query: any = { user_id: user };
    if (status !== null) {
      query.status = parseInt(status)
    }

    // Use an aggregation pipeline to fetch the required data, calculate balance, and join with Party collection
    const trips = await Trip.aggregate([
      { $match: query },  // Filter trips based on user_id and optional statuses
      {
        $lookup: {
          from: 'parties',  // Join with the Party collection
          localField: 'party',
          foreignField: 'party_id',
          as: 'partyDetails'
        }
      },
      { $unwind: '$partyDetails' },  // Unwind partyDetails array
      {
        $lookup: {
          from: 'drivers',  // Join with the Party collection
          localField: 'driver',
          foreignField: 'driver_id',
          as: 'driverDetails'
        }
      },
      { $unwind: '$partyDetails' },  // Unwind partyDetails array
      {
        $lookup: {
          from: 'tripcharges',  // Join with the TripExpense collection
          localField: 'trip_id',
          foreignField: 'trip_id',
          as: 'tripExpenses'
        }
      },
      {
        $lookup: {
          from: 'partypayments',
          localField: 'trip_id',
          foreignField: 'trip_id',
          as: 'tripAccounts'
        }
      },
      {
        $addFields: {
          // Calculate the final balance based on the fetchBalance logic
          balance: {
            $let: {
              vars: {
                accountBalance: {
                  $sum: {
                    $map: {
                      input: '$tripAccounts',
                      as: 'account',
                      in: '$$account.amount'
                    }
                  }
                },
                chargeToBill: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$tripExpenses',
                          as: 'expense',
                          cond: { $eq: ['$$expense.partyBill', true] }
                        }
                      },
                      as: 'filteredExpense',
                      in: '$$filteredExpense.amount'
                    }
                  }
                },
                chargeNotToBill: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$tripExpenses',
                          as: 'expense',
                          cond: { $eq: ['$$expense.partyBill', false] }
                        }
                      },
                      as: 'filteredExpense',
                      in: '$$filteredExpense.amount'
                    }
                  }
                }
              },
              in: {
                $subtract: [
                  { $add: ['$amount', '$$chargeToBill'] },  // Add trip amount and chargeToBill
                  { $add: ['$$accountBalance', '$$chargeNotToBill'] }  // Subtract accountBalance and chargeNotToBill
                ]
              }
            }
          },
          // Include the party name from the joined partyDetails
          partyName: '$partyDetails.name',
          driverName: '$driverDetails.name'
        }
      }, // Sort by startDate in descending order
      // Exclude unnecessary fields including accountBalance, chargeToBill, and chargeNotToBill
      { $project: { partyDetails: 0, tripExpenses: 0, accounts: 0, chargeToBill: 0, chargeNotToBill: 0, accountBalance: 0, user_id: 0 } }
    ]);

    return NextResponse.json({ trips });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  const { user, error } = await verifyToken(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    await connectToDatabase();

    const formData = await req.formData();
    const tripId = `trip${uuidv4()}`;

    // Handle file upload
    const file = formData.get("file") as File | null;
    let fileUrl = "";
    if (file) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileName = `trips/ewaybill-${tripId}`;
      fileUrl = await uploadFileToS3(fileBuffer, fileName, file.type);
      fileUrl += file.type === "application/pdf" ? ".pdf" : "";
    }

    // Handle pre-dated trip start date safely
    // Handle pre-dated trip start date safely for both `startDate` and `dates`
const rawDate = formData.get("startDate") as string;
let startDate: Date;

if (rawDate) {
  // Parse user date string (YYYY-MM-DD) accurately as local date
  const [year, month, day] = rawDate.split("-").map(Number);
  startDate = new Date(year, month - 1, day);
} else {
  startDate = new Date();
}

// Create new trip object and explicitly set both fields
const newTrip = new Trip({
  user_id: user,
  trip_id: tripId,
  party: formData.get("party"),
  truck: formData.get("truck"),
  driver: formData.get("driver"),
  supplier: formData.get("supplierId") || "",
  route: {
    origin: formData.get("origin"),
    destination: formData.get("destination"),
  },
  billingType: formData.get("billingType"),
  amount: Number(formData.get("amount")) || 0,
  balance: Number(formData.get("amount")) || 0,

  // Fix: set startDate & dates array both to user-selected date
  startDate: startDate,
  dates: [startDate, null, null, null, null],

  truckHireCost: Number(formData.get("truckHireCost")) || 0,
  fmNo: formData.get("fmNo"),
  LR: formData.get("LR"),
  status: 0,
  material: JSON.parse(formData.get("material") as string) || [],
  loadingSlipDetails: JSON.parse(formData.get("loadingSlipDetails") as string),
  notes: formData.get("notes") || "",
  accounts: [],
  documents: [],
});



    // Handle E-Way Bill upload
    const validity = formData.get("ewbValidity");
    if (validity) {
      newTrip.ewbValidityDate = new Date(validity as string);
      newTrip.documents.push({
        filename: file?.name || "",
        type: "E-Way Bill",
        validityDate: new Date(validity as string),
        uploadedDate: new Date(),
        url: fileUrl || "",
      });
    }

    // Validate non-fixed billing type
    if (newTrip.billingType !== "Fixed") {
      const units = formData.get("units");
      const rate = formData.get("rate");
      if (!units || !rate) {
        return NextResponse.json(
          { message: "Units and Rate must be specified", status: 400 },
          { status: 400 }
        );
      }
      newTrip.units = Number(units);
      newTrip.rate = Number(rate);
    }

    // Save trip and update recent activity in parallel
    const [savedTrip] = await Promise.all([
      newTrip.save(),
      recentActivity("Created New Trip", newTrip, user),
    ]);

    // Update driver and truck statuses
    await Promise.all([
      Driver.findOneAndUpdate({ user_id: user, driver_id: newTrip.driver }, { status: "On Trip" }),
      Truck.findOneAndUpdate({ user_id: user, truckNo: newTrip.truck }, { status: "On Trip" }),
    ]);

    return NextResponse.json({ message: "Saved Successfully", data: savedTrip }, { status: 200 });

  } catch (error: any) {
    console.error("Error saving trip:", error);

    const errorMapping: Record<string, { message: string; status: number }> = {
      ValidationError: { message: "Validation Error", status: 400 },
      MongoError: error.code === 11000 ? { message: "Duplicate Key Error", status: 409 } : { message: 'Mongo Error', status: 409 },
    };

    const { message, status } = errorMapping[error.name] || { message: "Internal Server Error", status: 500 };

    return NextResponse.json({ message, details: error.message }, { status });
  }
}


