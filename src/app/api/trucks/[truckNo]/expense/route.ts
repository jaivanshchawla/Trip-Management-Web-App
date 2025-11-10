import { verifyToken } from "@/utils/auth";
import { connectToDatabase, ExpenseSchema } from "@/utils/schema";
import { NextResponse } from "next/server";
import { maintenanceChargeTypes } from "@/utils/utilArray";
import { model, models } from "mongoose";

const Expense = models.Expense || model('Expense', ExpenseSchema)

export async function GET(req: Request, { params }: { params: { truckNo: string } }) {
  const { truckNo } = params;
  const url = new URL(req.url);
  const expenseType = url.searchParams.get('type');
  const { user, error } = await verifyToken(req);

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  await connectToDatabase();

  try {
    let filter : any= { user_id: user, truck: truckNo };
    
    if (expenseType === 'fuel') {
      filter = { ...filter, expenseType: 'Fuel Expense' };
    } else if (expenseType === 'maintenance') {
      filter = { ...filter, expenseType: { $in: Array.from(maintenanceChargeTypes) } };
    } else if (expenseType === 'other') {
      filter = { ...filter, expenseType: { $nin: Array.from(maintenanceChargeTypes) } };
    }

    const expenses = await Expense.aggregate([
      {
        $match : filter
      },
      {
        $lookup : {
          from : 'trips',
          localField : 'trip_id',
          foreignField : 'trip_id',
          as : 'trips'
        }
      },
      {
        $lookup : {
          from : 'drivers',
          localField : 'driver',
          foreignField : 'driver_id',
          as : 'drivers'
        }
      },
      {
        $addFields : {
          tripRoute : { $arrayElemAt : ['$trips.route', 0] },
          driverName : { $ifNull : [{ $arrayElemAt : ['$drivers.name', 0] }, 'N/A'] }
        }
      },{
        $project : {
          trips : 0
        }
      },
      {
        $sort : { date : -1 }
      }
    ]);
    return NextResponse.json({expenses , status : 200});
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: error.message, status: 500 });
  }
}
