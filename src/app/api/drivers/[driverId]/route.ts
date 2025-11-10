import { connectToDatabase, driverSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { v4 as uuidv4 } from 'uuid'

const Driver = models.Driver || model('Driver', driverSchema)

import { NextResponse } from 'next/server';
import { IDriver } from '@/utils/interface';
import { verifyToken } from "@/utils/auth";
import { recentActivity } from "@/helpers/recentActivity";


export async function GET(req: Request, { params }: { params: { driverId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { driverId } = params;

  try {
    await connectToDatabase();

    // const driver: IDriver = await Driver.findOne({ user_id: user, driver_id: driverId }).exec();
    const drivers = await Driver.aggregate([
      {
        $match: { user_id: user, driver_id: driverId }
      },
      {
        $lookup: {
          from: 'expenses',
          localField: 'driver_id',
          foreignField: 'driver',
          as: 'driverExpenses'
        }
      },
      {
        $lookup: {
          from: 'trips',
          localField: 'driver_id',
          foreignField: 'driver',
          as: 'driverTrips'
        }
      },
      {
        $lookup: {
          from: 'partypayments',
          localField: 'driver_id',
          foreignField: 'driver_id',
          as: 'tripAccounts'
        }
      },
      {
        $lookup: {
          from: 'parties',
          localField: 'driverTrips.party', // The field linking driverTrips to parties
          foreignField: 'party_id', // The matching field in parties
          as: 'partyDetails'
        }
      },
      {
        // Add party name to each trip
        $addFields: {
          driverTrips: {
            $map: {
              input: '$driverTrips',
              as: 'trip',
              in: {
                $mergeObjects: [
                  {
                    route: '$$trip.route',
                    LR: '$$trip.LR',
                    party_id: '$$trip.party',
                    trip_id: '$$trip.trip_id',
                    truck: '$$trip.truck',
                    startDate: '$$trip.startDate',
                    status: '$$trip.status'
                  },
                  {
                    partyName: {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: '$partyDetails',
                                as: 'party',
                                cond: { $eq: ['$$party.party_id', '$$trip.party'] } // Match party ID
                              }
                            },
                            as: 'party',
                            in: '$$party.name' // Extract only the name
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $addFields: {
          // Combine driver expenses and trip accounts from partypayments
          driverExpAccounts: {
            $concatArrays: [
              {
                $filter: {
                  input: '$driverExpenses',
                  as: 'expense',
                  cond: { $ne: ['$$expense.driver', ''] } // Filter out empty driver references
                }
              },
              {
                $filter: {
                  input: '$tripAccounts',
                  as: 'payment',
                  cond: { $ne: ['$$payment.amount', null] } // Include non-null payments
                }
              },
              {
                $ifNull: ['$accounts', []]
              }
            ]
          }
        }
      },
      {
        // Sort driverExpAccounts by date
        $addFields: {
          driverExpAccounts: {
            $sortArray: {
              input: '$driverExpAccounts',
              sortBy: { date: -1 } // Sort by date descending
            }
          }
        }
      },
      {
        // Calculate total trip account amounts from partypayments
        $addFields: {
          totalTripAccounts: {
            $reduce: {
              input: '$tripAccounts',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.amount'] }
            }
          },
          totalExpenses: {
            $reduce: {
              input: '$driverExpenses',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.amount'] }
            }
          },
          driverAccountsBalance: {
            $reduce: {
              input: '$accounts',
              initialValue: 0,
              in: { $add: ['$$value', { $subtract: ['$$this.got', '$$this.gave'] }] }
            }
          }
        }
      },
      {
        // Calculate final balance: (Trip accounts + driver accounts - total expenses)
        $addFields: {
          balance: {
            $subtract: [
              { $add: ['$totalTripAccounts', '$driverAccountsBalance'] },
              '$totalExpenses'
            ]
          }
        }
      },
      {
        // Project specific fields and exclude partyDetails
        $project: {
          tripAccounts: 0,
          driverExpenses: 0,
          partyDetails: 0, // Exclude partyDetails
        }
      }
    ]);


    if (!drivers) {
      return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({ driver: drivers[0], status: 200 });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { driverId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { driverId } = params
  const data = await req.json()
  try {
    await connectToDatabase();
    const driver: IDriver = await Driver.findOne({ user_id: user, driver_id: driverId }).exec();
    driver.balance = driver.balance + data.got - data.gave
    driver.accounts.push({
      account_id: 'account' + uuidv4(),
      date: data.date,
      reason: data.reason,
      gave: data.gave,
      got: data.got
    })

    await Promise.all([driver.save(),recentActivity('Added Driver Payments', driver, user)])
    return NextResponse.json({ accounts: driver.accounts , status: 200 })
  } catch (err) {
    console.log(err)
  }
}

export async function DELETE(req: Request, { params }: { params: { driverId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  const { driverId } = params;
  try {
    await connectToDatabase();
    const foundDriver = await Driver.findOne({ user_id: user, driver_id: driverId });
    if (foundDriver.status == 'On Trip') {
      return NextResponse.json({ message: 'Driver On Trip Cannot Delete' }, { status: 400 });
    }
    const driver = await Driver.findOneAndDelete({ driver_id: driverId });

    if (!driver) {
      return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Driver Deleted' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { driverId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    const { driverId } = params;
    const data = await req.json();

    console.log(data)

    await connectToDatabase(); // Ensure this function is properly defined and imported

    const driver = await Driver.findOneAndUpdate({ user_id: user, driver_id: driverId }, data, {new :true});

    if (!driver) {
      return NextResponse.json({ message: 'No Driver Found' }, { status: 404 });
    }

    await Promise.all([driver.save(), recentActivity('Updated Driver Detials', driver, user)]);

    return NextResponse.json({ driver: driver }, { status: 200 });
  } catch (err: any) {
    console.log(err)
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

