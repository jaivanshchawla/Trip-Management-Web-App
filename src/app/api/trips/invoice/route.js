

import { verifyToken } from "@/utils/auth";
import { connectToDatabase, InvoiceSchema, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Trip = models.Trip || model('Trip', tripSchema)
const Invoice = models.Invoice || model('Invoice', InvoiceSchema)


export async function GET(req: Request) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }

  const url = new URL(req.url)
  const reqTrips = JSON.parse(url.searchParams.get('trips') as string)
  console.log(reqTrips)

  try {
    await connectToDatabase();

    const trips = await Trip.aggregate([
      {
        $match: {
          user_id: user,
          trip_id: { $in: reqTrips }
        }
      },
      {
        $lookup: {
          from: 'parties',
          let: { party_id: '$party' },
          pipeline: [
            { $match: { $expr: { $eq: ['$party_id', '$$party_id'] } } },
            { $project: { name: 1, address : 1 } }  // Project only the fields needed
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
            { $project: { name: 1 } }
          ],
          as: 'driverDetails'
        }
      },
      { $unwind: '$driverDetails' },  // Unwind after filtered `$lookup`
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
          from: "tripcharges",
          let: { trip_id: "$trip_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$trip_id", "$$trip_id"] },
                partyBill: true
              }
            }
          ],
          as: "tripCharges"
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

    return NextResponse.json({ trips: trips }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}

