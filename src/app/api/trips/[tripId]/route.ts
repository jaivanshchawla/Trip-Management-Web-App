
import { fetchBalanceBack } from "@/helpers/fetchTripBalance";
import { uploadFileToS3 } from "@/helpers/fileOperation";
import { recentActivity } from "@/helpers/recentActivity";
import { verifyToken } from "@/utils/auth";
import { ITrip, PaymentBook } from "@/utils/interface";
import { connectToDatabase, driverSchema, ExpenseSchema, partySchema, supplierAccountSchema, tripChargesSchema, truckSchema } from "@/utils/schema";
import { tripSchema } from "@/utils/schema";
import { models, model } from 'mongoose'
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";


const Trip = models.Trip || model('Trip', tripSchema)
const TripCharges = models.TripCharges || model('TripCharges', tripChargesSchema)
const SupplierAccount = models.SupplierAccount || model('SupplierAccount', supplierAccountSchema)
const Expense = models.Expense || model('Expense', ExpenseSchema)

export async function GET(req: Request, { params }: { params: { tripId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { tripId } = params;

  try {
    await connectToDatabase();

    const trips = await Trip.aggregate([
      {
        $match: {
          user_id: user,
          trip_id: tripId
        }
      },
      {
        $lookup: {
          from: 'parties',
          let: { party_id: '$party' },
          pipeline: [
            { $match: { $expr: { $eq: ['$party_id', '$$party_id'] } } },
            { $project: { name: 1 } }  // Project only the fields needed
          ],
          as: 'partyDetails'
        }
      },
      { $unwind: '$partyDetails' },  // Unwind after filtered `$lookup`
      {
        $lookup: {
          from: 'suppliers',
          let: { supplier_id: '$supplier' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$supplier_id', '$$supplier_id'] },
                    { $ne: ['$supplier_id', null] },  // Exclude null supplier IDs
                    { $ne: ['$supplier_id', ''] }     // Exclude empty string supplier IDs
                  ]
                }
              }
            },
            { $project: { name: 1 } }
          ],
          as: 'supplierDetails'
        }
      },
      {
        $addFields: {
          supplierName: { $arrayElemAt: ['$supplierDetails.name', 0] }  // Extract supplier name
        }
      },
      {
        $lookup: {
          from: 'drivers',
          let: { driver_id: '$driver' },
          pipeline: [
            { $match: { $expr: { $eq: ['$driver_id', '$$driver_id'] } } },
            { $project: { name: 1 } },
          ],
          as: 'driverDetails',
        },
      },
      {
        $unwind: {
          path: '$driverDetails',
          preserveNullAndEmptyArrays: true, // Include documents where `driverDetails` is null or empty
        },
      },
      {
        $lookup: {
          from: 'expenses',
          let: { trip_id: '$trip_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$trip_id', '$$trip_id'] } } },
          ],
          as: 'tripExpenses'
        }
      },
      {
        $lookup: {
          from: 'tripcharges',
          let: { trip_id: '$trip_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$trip_id', '$$trip_id'] } } },
          ],
          as: 'tripCharges'
        }
      },
      {
        $lookup: {
          from: 'partypayments',
          let: { trip_id: '$trip_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$trip_id', '$$trip_id'] } } },
          ],
          as: 'tripAccounts'
        }
      },
      {
        $addFields: {
          balance: {
            $let: {
              vars: {
                accountBalance: { $sum: '$tripAccounts.amount' },
                chargeToBill: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$tripCharges',
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
                          input: '$tripCharges',
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
                  { $add: ['$amount', '$$chargeToBill'] },
                  { $add: ['$$accountBalance', '$$chargeNotToBill'] }
                ]
              }
            }
          },
          partyName: '$partyDetails.name',
          driverName: '$driverDetails.name'
        }
      },
      {
        $sort: { startDate: -1 }
      },
      {
        $project: {
          supplierDetails: 0,
          driverDetails: 0,
        }
      }
    ]);



    if (!trips) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ trip: trips[0] }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { tripId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    const { tripId } = params;
    const { data } = await req.json();
    console.log(data)
    const {  podImage, status, dates, notes } = data;
    // console.log(status)
    // console.log(dates)
    await connectToDatabase();


    const trip = await Trip.findOne({ user_id: user, trip_id: tripId });
    // console.log(trip)

    if (!trip) {
      return NextResponse.json({ message: 'No Trip Found' }, { status: 404 });
    }

    if (notes) {
      trip.notes = notes
    }

    if (status !== undefined && dates) {
      trip.status = status;
      trip.dates = dates;
    }

    if (podImage) {
      // Extract the MIME type and remove the Base64 prefix
      const base64String = podImage;
      const contentType = base64String.match(/^data:(.+);base64,/)[1];
      const base64Data = base64String.replace(/^data:.+;base64,/, '');

      // Convert the Base64 string to a Buffer
      const fileBuffer = Buffer.from(base64Data, 'base64');

      // Define the S3 file name
      const fileName = `trips/pod-${trip.trip_id}`;

      // Upload the file to S3
      const s3FileName = await uploadFileToS3(fileBuffer, fileName, contentType);
      const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3FileName}${contentType === 'application/pdf' ? '.pdf' : ''}`
      trip.documents.push({
        filename: '',
        validityDate: new Date(),
        uploadedDate: new Date(),
        type: 'POD',
        url: fileUrl
      })
    }


    await trip.save();
    return NextResponse.json({ trip: trip }, { status: 200 });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { tripId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { tripId } = params;

  try {
    await connectToDatabase();

    // Parse and validate incoming data
    const { data } = await req.json();
    if (!data) {
      return NextResponse.json({ message: 'No data provided' }, { status: 400 });
    }

    const Truck = models.Truck || model('Truck', truckSchema);
    const Driver = models.Driver || model('Driver', driverSchema);
    const Trip = models.Trip || model('Trip', tripSchema);

    // Fetch old trip details
    const oldTrip = await Trip.findOne({ user_id: user, trip_id: tripId });
    if (!oldTrip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    // Update trip data
    const updatedTrip = await Trip.findOneAndUpdate(
      { user_id: user, trip_id: tripId },
      data,
      { new: true }
    );
    if (!updatedTrip) {
      return NextResponse.json({ message: 'Trip update failed' }, { status: 404 });
    }

    // Handle E-Way Bill validity date
    if (data.ewbValidity) {
      const eWayBillDoc = updatedTrip.documents.find((doc : any) => doc.type === 'E-Way Bill');
      if (eWayBillDoc) {
        eWayBillDoc.validityDate = new Date(data.ewbValidity);
      } else {
        updatedTrip.documents.push({
          type: 'E-Way Bill',
          validityDate: new Date(data.ewbValidity),
          filename: '',
          uploadedDate: new Date(),
          url: '',
        });
      }
    }

    // Update trip start date
    if (data.startDate) {
      updatedTrip.dates[0] = data.startDate;
    }

    // Update statuses for driver and truck
    const isTripCompleted = updatedTrip?.status > 0;

    // Handle previous driver and truck
    if (oldTrip.driver !== updatedTrip.driver && oldTrip.driver) {
      await Driver.findOneAndUpdate({ driver_id: oldTrip.driver }, { status: 'Available' });
    }
    if (oldTrip.truck !== updatedTrip.truck && oldTrip.truck) {
      await Truck.findOneAndUpdate({ truckNo: oldTrip.truck }, { status: 'Available' });
    }

    // Handle new driver and truck
    if (updatedTrip.driver) {
      await Driver.findOneAndUpdate(
        { driver_id: updatedTrip.driver },
        { status: isTripCompleted ? 'Available' : 'On Trip' }
      );
    }
    if (updatedTrip.truck) {
      await Truck.findOneAndUpdate(
        { truckNo: updatedTrip.truck },
        { status: isTripCompleted ? 'Available' : 'On Trip' }
      );
    }

    await updatedTrip.save();

    // Log recent activity
    await recentActivity('Updated Trip Details', updatedTrip, user);

    return NextResponse.json({ trip: updatedTrip, status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message, status: 500 });
  }
}



export async function DELETE(req: Request, { params }: { params: { tripId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { tripId } = params;
  const Truck = models.Truck || model('Truck', truckSchema);
  const Driver = models.Driver || model('Driver', driverSchema);

  try {
    await connectToDatabase();

    const trip = await Trip.findOneAndDelete({ user_id: user, trip_id: tripId }).exec();

    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    await Truck.findOneAndUpdate({ user_id: user, truckNo: trip.truck }, { status: 'Available' })
    await Driver.findOneAndUpdate({ user_id: user, driver_id: trip.driver }, { status: 'Available' })
    await TripCharges.deleteMany({ user_id: user, trip_id: tripId })
    await Expense.deleteMany({ user_id: user, trip_id: tripId })
    await SupplierAccount.deleteMany({ user_id: user, trip_id: tripId })

    return NextResponse.json({ trip }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}