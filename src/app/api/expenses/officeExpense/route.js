import { verifyToken } from "@/utils/auth";
import { connectToDatabase, ExpenseSchema, OfficeExpenseSchema } from "@/utils/schema";
import { monthMap } from "@/utils/utilArray";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Expense = models.Expense || model('Expense', ExpenseSchema)

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

      console.log(dateConditions)

      query.$and = query.$and || [];
      query.$and.push({ $or: dateConditions });
    }

    // Add additional filters (drivers, trucks, etc.) if they exist


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
        {
          $or: [
            { trip_id: { $exists: false } },
            { trip_id: { $eq: '' } }
          ]
        },
        {
          $or: [
            { truck: { $exists: false } },
            { truck: { $eq: '' } }
          ]
        }
      ]

    });

    await connectToDatabase();
    const expenses = await Expense.aggregate([
      {
        $match: query
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
          shopName: { $ifNull: [{ $arrayElemAt: ['$shops.name', 0] }, 'N/A'] } // Provide 'N/A' if no shop
        }
      },
      {
        $project: {
          shops: 0,
        }
      }
    ]).sort({date : -1});

    return NextResponse.json({ expenses: expenses, status: 200 });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({ message: err.message, status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, error } = await verifyToken(req)
    if (!user || error) {
      return NextResponse.json({ error })
    }
    await connectToDatabase()
    const data = await req.json()
    const expense = new Expense({ ...data, user_id: user })
    await expense.save()
    return NextResponse.json({ expense, status: 200 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ status: 500, error })
  }
}