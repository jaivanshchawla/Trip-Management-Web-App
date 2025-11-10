import { verifyToken } from "@/utils/auth";
import { connectToDatabase, tripChargesSchema, ExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Expense = models.Expense || model('Expense', ExpenseSchema);
const monthMap: { [key: string]: number } = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11
  };

export async function GET(req: Request) {
    try {
        const { user, error } = await verifyToken(req);
        if (error) {
            return NextResponse.json({ error });
        }

        const url = new URL(req.url);
        const filter = JSON.parse(url.searchParams.get('filter') as string);

        let query: any = { user_id: user };

        // Handle the month-year array in filter?
        if (filter && filter.monthYear && filter.monthYear.length > 0) {
            const dateConditions = filter.monthYear.map((monYear: string) => {
                const [month, year] = monYear.split(' ');
                const monthNumber = monthMap[month];
                const startDate = new Date(parseInt(year), monthNumber, 1);
                const endDate = new Date(parseInt(year), monthNumber + 1, 1);

                return {
                    date: {
                        $gte: startDate,
                        $lt: endDate
                    }
                };
            });


            query.$and = query.$and || [];
            query.$and.push({ $or: dateConditions });
        }

        // Add additional filters (drivers, trucks, etc.) if they exist
        if (filter?.drivers && filter.drivers.length > 0) {
            query.$and = query.$and || [];
            query.$and.push({ driver: { $in: filter.drivers } });
        }

        if (filter?.trucks && filter.trucks.length > 0) {
            query.$and = query.$and || [];
            query.$and.push({ truck: { $in: filter.trucks } });
        }

        if (filter?.paymentModes && filter.paymentModes.length > 0) {
            query.$and = query.$and || [];
            query.$and.push({ paymentMode: { $in: filter.paymentModes } });
        }

        if (filter?.shops && filter.shops.length > 0) {
            query.$and = query.$and || [];
            query.$and.push({ shop_id: { $in: filter.shops } });
        }

        if (filter?.expenseTypes && filter.expenseTypes.length > 0) {
            query.$and = query.$and || [];
            query.$and.push({ expenseType: { $in: filter.expenseTypes } });
        }

        query.$and = query.$and || [];
        query.$and.push({
            $and: [
                { trip_id: { $exists: true } },
                { trip_id: { $ne: '' } }
            ]
        });

        await connectToDatabase();
        const tripExpense = await Expense.aggregate([
            {
                $match: query
            },
            {
                // Lookup trips details
                $lookup: {
                    from: 'trips',
                    localField: 'trip_id',
                    foreignField: 'trip_id',
                    as: 'trips'
                }
            },
            {
                // Lookup drivers details if driver_id exists
                $lookup: {
                    from: 'drivers',
                    let: { driver_id: '$driver' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$driver_id', '$$driver_id'] // Match only if driver_id exists
                                }
                            }
                        }
                    ],
                    as: 'drivers'
                }
            },
            {
                // Lookup shops details if shop_id exists
                $lookup: {
                    from: 'shopkhatas',
                    let: { shop_id: '$shop_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$shop_id', '$$shop_id'] // Match only if shop_id exists
                                }
                            }
                        }
                    ],
                    as: 'shops'
                }
            },
            {
                // Add fields for results and handle cases where lookups return empty arrays
                $addFields: {
                    tripRoute: { $arrayElemAt: ['$trips.route', 0] }, // Access route from trips if it exists
                    driverName: { $ifNull: [{ $arrayElemAt: ['$drivers.name', 0] }, 'N/A'] }, // Provide 'N/A' if no driver
                    shopName: { $ifNull: [{ $arrayElemAt: ['$shops.name', 0] }, 'N/A'] } // Provide 'N/A' if no shop
                }
            },
            {
                $project: {
                    shops: 0,
                    drivers: 0,
                    trips: 0
                }
            },
            {
                $sort : { date : -1}
              }
        ]);
        return NextResponse.json({ tripExpense, status: 200 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error, status: 500 })
    }

}
