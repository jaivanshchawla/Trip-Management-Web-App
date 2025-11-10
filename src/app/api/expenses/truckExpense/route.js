import { verifyToken } from "@/utils/auth";
import { connectToDatabase, ExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Expense = models.Expense || model('Expense', ExpenseSchema)

const monthMap = {
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

export async function GET(req) {
  try {
    const { user, error } = await verifyToken(req);
    if (error) {
      return NextResponse.json({ error });
    }

    const url = new URL(req.url);
    const filter = JSON.parse(url.searchParams.get('filter') );

    let query = { user_id: user };

    // Handle the month-year array in filter?
    if (filter && filter.monthYear && filter.monthYear.length > 0) {
      const dateConditions = filter.monthYear.map((monYear) => {
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

      console.log(dateConditions)

      query.$and = query.$and || [];
      query.$and.push({ $or: dateConditions });
    }

    // Add additional filters (drivers, trucks, etc.) if they exist
    if (filter?.drivers && filter.drivers.length > 0) {
      query.$and = query.$and || [];
      query.$and.push({ driver });
    }

    if (filter?.trucks && filter.trucks.length > 0) {
      query.$and = query.$and || [];
      query.$and.push({ truck });
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
      $and: [{ truck }, { truck }], // truck must exist
      $or: [ { trip_id: { $exists: false } }, // trip_id must not exist { trip_id: { $eq: '' } } // or trip_id is an empty string
      ]
    });



    // Connect to the database and run the query
    await connectToDatabase();
    const expenses = await Expense.aggregate([ { $match: query },
      // Lookup logic for drivers and shops (as you already have) {
        $lookup: {
          from: 'drivers',
          localField: 'driver',
          foreignField: 'driver_id',
          as: 'drivers'
        }
      }, {
        $lookup: {
          from: 'shopkhatas',
          let: { shop_id: '$shop_id' },
          pipeline: [ {
              $match: {
                $expr: { $eq: ['$shop_id', '$$shop_id'] }
              }
            }
          ],
          as: 'shops'
        }
      }, {
        $addFields: {
          driverName, 'N/A'] },
          shopName, 'N/A'] }
        }
      }, {
        $project: {
          shops: 0,
          drivers: 0
        }
      }, {
        $sort : { date : -1}
      }
    ]);

    return NextResponse.json({ truckExpense: expenses, status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: err.message, status: 500 });
  }
}
