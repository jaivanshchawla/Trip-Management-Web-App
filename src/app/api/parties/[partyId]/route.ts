import { recentActivity } from "@/helpers/recentActivity";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase } from "@/utils/schema";
import { partySchema } from "@/utils/schema";
import { models, model } from 'mongoose'
import { NextResponse } from "next/server";


const Party = models.Party || model('Party', partySchema)

export async function GET(req: Request, { params }: { params: { partyId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { partyId } = params;

  try {
    await connectToDatabase();

    // const party = await Party.findOne({ party_id: partyId, user_id: user }).lean().exec();
    const parties = await Party.aggregate([
      {
        $match: { user_id: user, party_id: partyId }
      },
      {
        $lookup: {
          from: 'trips',
          localField: 'party_id',
          foreignField: 'party',
          as: 'trips'
        }
      },
      {
        $lookup: {
          from: 'partypayments',
          localField: 'party_id',
          foreignField: 'party_id',
          as: 'partyPayments'
        }
      },
      {
        $lookup: {
          from: 'tripcharges',
          localField: 'trips.trip_id',
          foreignField: 'trip_id',
          as: 'tripCharges'
        }
      },
      {
        $addFields: {
          trips: {
            $map: {
              input: '$trips',
              as: 'trip',
              in: {
                type: 'trip',
                date: '$$trip.startDate',
                description: '$$trip.route',
                status: '$$trip.status',
                trip_id: '$$trip.trip_id',
                truck: '$$trip.truck',
                amount : '$$trip.amount',
                revenue: {
                  $let: {
                    vars: {
                      chargeToBill: {
                        $sum: {
                          $filter: {
                            input: '$tripCharges',
                            as: 'charge',
                            cond: { $eq: ['$$charge.partyBill', true] }
                          }
                        }
                      },
                      chargeNotToBill: {
                        $sum: {
                          $filter: {
                            input: '$tripCharges',
                            as: 'charge',
                            cond: { $eq: ['$$charge.partyBill', false] }
                          }
                        }
                      }
                    },
                    in: {
                      $subtract: [
                        { $add: ['$$trip.amount', '$$chargeToBill'] },
                        '$$chargeNotToBill'
                      ]
                    }
                  }
                },
                totalPayments: {
                  $let: {
                    vars: {
                      matchingPayments: {
                        $filter: {
                          input: '$partyPayments',
                          as: 'payment',
                          cond: { $eq: ['$$payment.trip_id', '$$trip.trip_id'] }
                        }
                      }
                    },
                    in: { $sum: '$$matchingPayments.amount' }
                  }
                }
              }
            }
          },
          partyPayments: {
            $map: {
              input: '$partyPayments',
              as: 'payment',
              in: {
                _id : '$$payment._id',
                type: 'payment',
                date: '$$payment.date',
                amount: '$$payment.amount',
                description: 'Payment',
                paymentType: '$$payment.paymentType',
                trip_id: { $ifNull: ['$$payment.trip_id', null] }
              }
            }
          }
        }
      },
      {
        // Combine `trips` and `partyPayments` into a single array
        $addFields: {
          items: { $concatArrays: ['$trips', '$partyPayments'] }
        }
      },
      {
        // Sort by date descending
        $sort: { 'items.date': -1 }
      },
      {
        // Group final result
        $group: {
          _id: '$_id',
          party_id: { $first: '$party_id' },
          name: { $first: '$name' },
          contactNumber: { $first: '$contactNumber' },
          contactPerson: { $first: '$contactPerson' },
          address: { $first: '$address' },
          gstNumber: { $first: '$gstNumber' },
          items: { $first: '$items' }  // Keep sorted items
        }
      }
    ]);




    if (!parties) {
      return NextResponse.json({ message: 'Party not found' }, { status: 404 });
    }

    return NextResponse.json({ party: parties[0] }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { partyId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { partyId } = params;
  const data = await req.json()

  try {
    await connectToDatabase();

    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (data.gstNumber && !gstRegex.test(data.gstNumber)) {
      return NextResponse.json({ message: 'Invalid GST number' }, { status: 400 });
    }

    // Phone number validation (10 digits starting with 7, 8, or 9)
    const phoneRegex = /^[789]\d{9}$/;
    if (data.contactNumber != '' && !phoneRegex.test(data.contactNumber)) {
      return NextResponse.json({ message: 'Invalid phone number' }, { status: 400 });
    }

    const party = await Party.findOneAndUpdate({ party_id: partyId, user_id: user }, data, { new: true }).lean().exec();
    await recentActivity('Updated Customer Details', party, user)

    if (!party) {
      return NextResponse.json({ message: 'Party not found' }, { status: 404 });
    }

    return NextResponse.json({ party: party }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { partyId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { partyId } = params;

  try {
    await connectToDatabase();

    const party = await Party.findOneAndDelete({ party_id: partyId, user_id: user }).lean().exec();

    if (!party) {
      return NextResponse.json({ message: 'Party not found' }, { status: 404 });
    }

    return NextResponse.json({ party: party }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}