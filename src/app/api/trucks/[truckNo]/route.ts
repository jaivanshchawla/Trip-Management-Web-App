import { NextResponse } from 'next/server';// Ensure to import Request from 'express' or another appropriate package
import { connectToDatabase, ExpenseSchema, tripSchema, truckSchema } from '@/utils/schema';
import { TruckModel } from '@/utils/interface';
import mongoose, { model, Model, models } from 'mongoose';
import { verifyToken } from '@/utils/auth';
import { recentActivity } from '@/helpers/recentActivity';

const Truck = mongoose.models.Truck || mongoose.model<TruckModel>('Truck', truckSchema);
const Trip = models.Trip || model('Trip', tripSchema)
const Expense = models.Expense || model('Expense', ExpenseSchema)

export async function PATCH(req: Request, { params }: { params: { truckNo: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    const { truckNo } = params;
    const { status } = await req.json(); // Assuming 'status' is in the body of the PATCH request

    await connectToDatabase(); // Ensure this function is properly defined and imported

    const truck = await Truck.findOne({ user_id: user, truckNo: truckNo });

    if (!truck) {
      return NextResponse.json({ message: 'No Truck Found' }, { status: 404 });
    }

    if (status) truck.status = status;

    await truck.save();

    return NextResponse.json({ truck: truck }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}


export async function PUT(req: Request, { params }: { params: { truckNo: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const { truckNo } = params;
    const data = await req.json();


    await connectToDatabase();

    const truck = await Truck.findOneAndUpdate({ user_id: user, truckNo }, data, { new: true });

    if (!truck) {
      return NextResponse.json({ message: 'No Truck Found' }, { status: 404 });
    }

    const trips = await Trip.updateMany({ user_id: user, truck: truckNo }, { $set: { truck: data.truckNo } });


    // Update the truck number in the Expense collection
    const [updatedExpenses, un] = await Promise.all([Expense.updateMany(
      { user_id: user, truck: truckNo }, // Query to find matching documents with the old truck number
      { $set: { truck: data.truckNo } }  // Update operation to set the new truck number
    ), recentActivity('Updated Lorry Details', truck, user)]);

    return NextResponse.json({ truck, status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { truckNo: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    const { truckNo } = params;// Assuming 'status' is in the body of the PATCH request

    await connectToDatabase(); // Ensure this function is properly defined and imported

    const truck = await Truck.aggregate([
      {
        $match: {
          user_id: user,
          truckNo: truckNo
        }
      },
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
          from: 'trips',
          let: { truckNo: '$truckNo', userId: user },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$truck', '$$truckNo'] },
                    { $eq: ['$user_id', '$$userId'] }
                  ]
                }
              }
            }
          ],
          as: 'trips'
        }
      },
      {
        $lookup: {
          from: 'expenses',
          let: { truckNo: '$truckNo', userId: user},
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$truck', '$$truckNo'] },
                    { $eq: ['$user_id', '$$userId'] }
                  ]
                }
              }
            }
          ],
          as: 'expenses'
        }
      },
      
      // Perform lookup to add partyName from 'parties' collection to each trip
      {
        $lookup: {
          from: 'parties',
          localField: 'trips.party',    // Use the party_id field from trips
          foreignField: 'party_id',             // Use the _id field from parties
          as: 'partyDetails'
        }
      },
      {
        $unwind: { path: '$partyDetails', preserveNullAndEmptyArrays: true } // Unwind to access party details
      },
      // Add tripRevenue to trips and rename startDate to date for uniform sorting
      {
        $addFields: {
          trips: {
            $map: {
              input: '$trips',
              as: 'trip',
              in: {
                $mergeObjects: [
                  '$$trip',
                  {
                    tripRevenue: {
                      $add: [
                        '$$trip.amount',
                        {
                          $reduce: {
                            input: '$$trip.accounts',
                            initialValue: 0,
                            in: {
                              $cond: [
                                { $eq: ['$$this.partyBill', true] },
                                { $add: ['$$value', '$$this.amount'] },
                                '$$value'
                              ]
                            }
                          }
                        }
                      ]
                    },
                    date: '$$trip.startDate',  // Rename startDate to date
                    partyName: '$partyDetails.name',  // Add partyName from lookup
                    type: 'trip'
                  }
                ]
              }
            }
          }
        }
      },
      // Combine trips and expenses into truckLedger array
      {
        $addFields: {
          truckLedger: { $concatArrays: ['$trips', '$expenses'] }
        }
      },
      // Sort the combined truckLedger array by date
      {
        $addFields: {
          truckLedger: { $sortArray: { input: '$truckLedger', sortBy: { date: -1 } } }  // 1 for ascending
        }
      },
      // Optionally project to return only necessary fields
      {
        $project: {
          trips: 0,      // Optionally exclude original trips
          expenses: 0,   // Optionally exclude original expenses
          // Include other fields if necessary
        }
      }
    ]);


    if (!truck) {
      return NextResponse.json({ message: 'No Truck Found' }, { status: 404 });
    }

    return NextResponse.json({ truck: truck[0] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { truckNo: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    const { truckNo } = params;// Assuming 'status' is in the body of the PATCH request

    await connectToDatabase(); // Ensure this function is properly defined and imported

    const foundTruck = await Truck.findOne({ user_id: user, truckNo: truckNo });
    if (foundTruck.status == 'On Trip') {
      return NextResponse.json({ message: "Truck currently on Trip", status: 400 })
    }

    const trips = await Trip.find({ user_id: user, truck: truckNo });

    if (trips.length > 0) {
      const tripDetails = trips.map((trip) => {
        const origin = trip.route.origin;
        const destination = trip.route.destination;
        return `${origin} -> ${destination} ${new Date(trip.startDate).toISOString().split('T')[0]}`;
      }).join(', ');

      return NextResponse.json({
        message: `Truck is associated with trips:\n ${tripDetails}`,
        status: 400
      });
    }
    const truck = await Truck.findOneAndDelete({ user_id: user, truckNo: truckNo });

    if (!truck) {
      return NextResponse.json({ message: 'No Truck Found' }, { status: 404 });
    }

    return NextResponse.json({ truck: truck }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}