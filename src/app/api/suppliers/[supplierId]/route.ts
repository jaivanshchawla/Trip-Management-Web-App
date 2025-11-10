// Import necessary modules and schemas
import { connectToDatabase, supplierAccountSchema, tripSchema } from "@/utils/schema";
import { models, model } from 'mongoose';
import { supplierSchema } from "@/utils/schema";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { recentActivity } from "@/helpers/recentActivity";

// Retrieve or define Mongoose model for Supplier
const Supplier = models.Supplier || model('Supplier', supplierSchema);
const SupplierAccount = models.SupplierAccount || model('SupplierAccount', supplierAccountSchema);
const Trip = models.Trip || model('Trip', tripSchema);
// GET request handler function
export async function GET(req: Request, { params }: { params: { supplierId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { supplierId } = params;

  try {
    // Connect to the MongoDB database
    await connectToDatabase();

    // Find the supplier based on supplierId
    // const supplier = await Supplier.findOne({ user_id: user, supplier_id: supplierId }).lean();
    const suppliers = await Supplier.aggregate([
      {
        $match: { user_id: user, supplier_id: supplierId }
      },
      {
        // Lookup trucks related to the supplier and fetch necessary fields
        $lookup: {
          from: 'trucks',
          localField: 'supplier_id',
          foreignField: 'supplier',
          pipeline: [
            { $match: { user_id: user } }, // Filter trucks by user_id
            {
              $lookup: {
                from: 'drivers',
                localField: 'driver_id',
                foreignField: 'driver_id',
                pipeline: [
                  { $project: { name: 1 } } // Only get the driver name
                ],
                as: 'drivers'
              }
            },
            {
              $lookup: {
                from: 'trips',
                localField: 'truckNo',
                foreignField: 'truck',
                pipeline: [
                  { $project: { trip_id: 1, party: 1, route: 1, startDate: 1, status: 1 } }
                ],
                as: 'trips'
              }
            },
            {
              $unwind: { path: '$trips', preserveNullAndEmptyArrays: true } // Allow trucks with no trips
            },
            {
              $lookup: {
                from: 'parties',
                localField: 'trips.party',
                foreignField: 'party_id',
                pipeline: [
                  { $project: { name: 1 } } // Only get the party name
                ],
                as: 'partyDetails'
              }
            },
            {
              $unwind: { path: '$partyDetails', preserveNullAndEmptyArrays: true } // Handle trips without party data
            },
            {
              $group: {
                _id: '$_id', // Group by truck
                truckNo: { $first: '$truckNo' },
                truckType: { $first: '$truckType' },
                model: { $first: '$model' },
                capacity: { $first: '$capacity' },
                bodyLength: { $first: '$bodyLength' },
                ownership: { $first: '$ownership' },
                status: { $first: '$status' },
                driver_id: { $first: '$driver_id' },
                driverName: { $first: { $arrayElemAt: ['$drivers.name', 0] } }, // Extract driver name
                trips: {
                  $push: {
                    trip_id: '$trips.trip_id',
                    partyName: '$partyDetails.name',
                    route: '$trips.route',
                    startDate: '$trips.startDate',
                    status: '$trips.status'
                  }
                }
              }
            },
            {
              $addFields: {
                trips: { $sortArray: { input: '$trips', sortBy: { startDate: -1 } } } // Sort trips by startDate descending
              }
            },
            {
              $addFields: {
                latestTrip: { $arrayElemAt: ['$trips', 0] } // Extract the latest trip after sorting
              }
            },
            {
              $project: { trips: 0 } // Exclude trips field if only latestTrip is needed
            }
          ],
          as: 'supplierTrucks'
        }
      },
      {
        $lookup: {
          from: 'trips',
          localField: 'supplier_id',
          foreignField: 'supplier',
          as: 'supplierTrips'
        }
      },
      {
        $lookup: {
          from: 'supplieraccounts',
          localField: 'supplier_id',
          foreignField: 'supplier_id',
          as: 'supplierAccounts'
        }
      },
      {
        $addFields: {
          supplierTripAccounts: {
            $concatArrays: [
              {
                $map: {
                  input: { $ifNull: ['$supplierTrips', []] },
                  as: 'trip',
                  in: {
                    trip_id: '$$trip.trip_id',
                    supplier_id: '$$trip.supplier',
                    truckHireCost: '$$trip.truckHireCost',
                    route: '$$trip.route',
                    LR: '$$trip.LR',
                    date: '$$trip.startDate',
                    type: 'trip',
                    status: '$$trip.status',
                    truck: '$$trip.truck',
                    amount: { $ifNull: ['$$trip.truckHireCost', 0] },
                    balance: { $subtract: [0, '$$trip.truckHireCost'] }
                  }
                }
              },
              {
                $map: {
                  input: { $ifNull: ['$supplierAccounts', []] },
                  as: 'payment',
                  in: {
                    _id: '$$payment._id',
                    supplier_id: '$$payment.supplier_id',
                    date: '$$payment.date',
                    type: 'payment',
                    amount: { $ifNull: ['$$payment.amount', 0] },
                    balance: { $add: [0, '$$payment.amount'] },
                    route: {
                      $let: {
                        vars: {
                          matchedTrip: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: { $ifNull: ['$supplierTrips', []] },
                                  as: 'trip',
                                  cond: { $eq: ['$$trip.trip_id', '$$payment.trip_id'] }
                                }
                              },
                              0
                            ]
                          }
                        },
                        in: { $ifNull: ['$$matchedTrip.route', null] }
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      },
      {
        $addFields: {
          supplierTripAccounts: {
            $sortArray: {
              input: '$supplierTripAccounts',
              sortBy: { date: 1 }
            }
          }
        }
      },
      {
        $addFields: {
          supplierTripAccounts: {
            $reduce: {
              input: '$supplierTripAccounts',
              initialValue: { balance: 0, items: [] },
              in: {
                balance: { $add: ['$$value.balance', '$$this.balance'] },
                items: {
                  $concatArrays: [
                    '$$value.items',
                    [
                      {
                        $mergeObjects: [
                          '$$this',
                          { balance: { $add: ['$$value.balance', '$$this.balance'] } }
                        ]
                      }
                    ]
                  ]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          supplierTripAccounts: '$supplierTripAccounts.items',
          balance: '$supplierTripAccounts.balance',
          name: 1,
          contactNumber: 1,
          supplier_id: 1,
          supplierTrucks: 1 // Include supplierTrucks in the output
        }
      }
    ]);


    // Handle case where supplier is not found
    if (!suppliers) {
      return NextResponse.json({ message: "No supplier found" }, { status: 404 });
    }

    // Return the supplier details
    return NextResponse.json({ supplier: suppliers[0] }, { status: 200 });

  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { supplierId: String } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { supplierId } = params;
  const data = await req.json()
  const newBalance = data.truckHireCost

  try {
    await connectToDatabase()
    const supplier = await Supplier.findOne({ user_id: user, supplier_id: supplierId })
    supplier.balance = parseFloat(supplier.balance) + parseFloat(newBalance)
    await supplier.save()
    return NextResponse.json({ message: 'Balance updated successfully', balance: supplier.balance }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { supplierId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }
  const { supplierId } = params;

  // Start a session for transaction support
  const session = await Supplier.startSession();
  
  try {
    // Connect to the MongoDB database
    await connectToDatabase();

    // Start transaction
    await session.startTransaction();

    // Find the supplier to verify it exists and belongs to the user
    const supplier = await Supplier.findOne({ user_id: user, supplier_id: supplierId }).session(session);

    // Handle case where supplier is not found
    if (!supplier) {
      await session.abortTransaction();
      return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
    }

    // Delete all SupplierAccount records for this supplier
    await SupplierAccount.deleteMany({ 
      user_id: user, 
      supplier_id: supplierId 
    }).session(session);

    // Update all Trip records that reference this supplier
    // Set truckHireCost to 0 and clear supplier field
    await Trip.updateMany(
      { 
        user_id: user, 
        supplier: supplierId 
      },
      { 
        $set: { 
          truckHireCost: 0,
          supplier: '' 
        } 
      }
    ).session(session);

    // Delete the supplier document
    await Supplier.deleteOne({ 
      user_id: user, 
      supplier_id: supplierId 
    }).session(session);

    // Commit the transaction
    await session.commitTransaction();

    // Return success response
    return NextResponse.json({ 
      message: "Supplier deleted successfully" 
    }, { status: 200 });

  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ 
      message: "Failed to delete supplier. Please try again." 
    }, { status: 500 });
  } finally {
    // End the session
    await session.endSession();
  }
}

export async function PUT(req: Request, { params }: { params: { supplierId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { supplierId } = params;
  const data = await req.json()

  try {
    // Connect to the MongoDB database
    await connectToDatabase();

    // Find the supplier based on supplierId
    const phoneRegex = /^[789]\d{9}$/;
    if (data.contactNumber != '' && !phoneRegex.test(data.contactNumber)) {
      return NextResponse.json({ message: 'Invalid phone number' }, { status: 400 });
    }
    const supplier = await Supplier.findOneAndUpdate({ user_id: user, supplier_id: supplierId }, data).lean();
    await recentActivity('Updated Supplier Details', supplier, user)

    // Handle case where supplier is not found
    if (!supplier) {
      return NextResponse.json({ message: "No supplier found" }, { status: 404 });
    }

    // Return the supplier details
    return NextResponse.json({ supplier: supplier }, { status: 200 });

  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

