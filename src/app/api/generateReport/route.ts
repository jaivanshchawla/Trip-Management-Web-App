import { recentActivity } from "@/helpers/recentActivity";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, ExpenseSchema, OfficeExpenseSchema, tripChargesSchema, tripSchema, truckSchema } from "@/utils/schema";
import { monthMap } from "@/utils/utilArray";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Trip = models.Trip || model('Trip', tripSchema);
const Expense = models.Expense || model('Expense', ExpenseSchema);
const TripCharges = models.TripCharges || model('TripCharges', tripChargesSchema);
const Truck = models.Truck || model('Truck', truckSchema);
const OfficeExpense = models.OfficeExpense || model('OfficeExpense', OfficeExpenseSchema);

export async function GET(req: Request) {
    try {
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error });
        }

        const url = new URL(req.url);
        const month = url.searchParams.get('month');
        const year = url.searchParams.get('year');

        const monthNumber = monthMap[month as any];
        if (monthNumber === undefined) {
            return NextResponse.json({ error: 'Invalid month name', status: 400 });
        }

        const startDate = new Date(year as any, monthNumber, 1);
        const endDate = new Date(year as any, monthNumber + 1, 1);

        await connectToDatabase();

        const tripsData = await Trip.aggregate([
            {
                $match: {
                    user_id: user,
                    startDate: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $lookup: {
                    from: 'trucks',
                    localField: 'truck',
                    foreignField: 'truckNo',
                    as: 'truckDetails'
                }
            },
            { $unwind: '$truckDetails' },
            {
                $lookup: {
                    from: 'tripcharges',
                    localField: 'trip_id',
                    foreignField: 'trip_id',
                    as: 'charges'
                }
            },
            { $unwind: { path: '$charges', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$truckDetails.ownership',
                    tripCount: { $sum: 1 }, // Counting the number of trips per ownership type
                    totalFreight: { $sum: '$amount' },
                    totalCharges: {
                        $sum: {
                            $cond: [{ $eq: ['$charges.partyBill', true] }, { $ifNull: ['$charges.amount', 0] }, 0]
                        }
                    },
                    totalDeductions: {
                        $sum: {
                            $cond: [{ $eq: ['$charges.partyBill', false] }, { $ifNull: ['$charges.amount', 0] }, 0]
                        }
                    },
                    trips: { $push: '$$ROOT' }
                }
            }
        ]);

        const marketTruckTrips = tripsData.find(d => d._id === 'Market') || { trips: [], tripCount: 0, totalFreight: 0, totalCharges: 0, totalDeductions: 0 };
        const ownTruckTrips = tripsData.find(d => d._id === 'Self') || { trips: [], tripCount: 0, totalFreight: 0, totalCharges: 0, totalDeductions: 0 };



        const [expenses, officeExpenses] = await Promise.all([
            // Fetch all expenses within the date range
            Expense.find({ user_id: user, date: { $gte: startDate, $lt: endDate } }).select('amount').lean(),

            // Fetch office expenses where trip_id and truck are either empty strings or null
            Expense.find({
                user_id: user,
                date: { $gte: startDate, $lt: endDate },
                $or: [
                    { trip_id: "" },
                    { trip_id: null },
                    { truck: "" },
                    { truck: null }
                ]
            }).select('amount').lean()
        ]);


        const totalExpense = expenses.reduce((total, expense) => total + expense.amount, 0);
        const totalOfficeExpense = officeExpenses.reduce((total, expense) => total + expense.amount, 0);

        const marketTruckProfit = marketTruckTrips.totalFreight + marketTruckTrips.totalCharges - marketTruckTrips.totalDeductions - totalExpense;
        const ownTruckProfit = ownTruckTrips.totalFreight + ownTruckTrips.totalCharges - ownTruckTrips.totalDeductions - totalOfficeExpense;

        const totalTrips = marketTruckTrips.tripCount + ownTruckTrips.tripCount; // Total number of trips

        const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Balance Report for ${month} ${year}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f8ff;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color : #F3FAFF;
            padding : 2rem
        }
        h1 {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        .card {
            background-color: white;
            border-radius: 8px;
            border : 1px solid #E5E7EB;
            padding: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .card-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }
        .card-value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        .section-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        .grid-4 {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        .small-card {
            background-color: white;
            border-radius: 8px;
            border : 1px solid #E5E7EB;
            padding: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .small-card-title {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        .small-card-value {
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }
        .profit {
            color: #22c55e;
        }
        .expense {
            color: #ef4444;
        }
        .button {
            background-color: #f97316;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            display: block;
            width: 100%;
            max-width: 200px;
            margin: 20px auto;
            text-align: center;
        }
            .footer {
            display : inline-flex;
            align-items: center;
            gap : 2px;
  text-align: center;
  padding: 10px;
  font-size: 14px;
  color: #333;
}

.footer-logo {
  width: 20px;
  height: auto;
  vertical-align: middle;
  margin: 0 5px;
}

    </style>
</head>
<body>
    <div class="container">
        <h1>Balance Report for ${month} ${year}</h1>
        
        <div class="grid">
            <div class="card">
                <div class="card-title">Overall Profit</div>
                <div class="card-value profit">₹${ownTruckProfit + marketTruckProfit}</div>
            </div>
            <div class="card">
                <div class="card-title">Total Trips</div>
                <div class="card-value">${totalTrips}</div>
            </div>
        </div>

        <div class="section-title">Revenue from Market Trucks</div>
        <div class="grid-4">
            <div class="small-card">
                <div class="small-card-title">Total Freight</div>
                <div class="small-card-value">${marketTruckTrips.totalFreight}</div>
            </div>
            <div class="small-card">
                <div class="small-card-title">Total Charges</div>
                <div class="small-card-value">${marketTruckTrips.totalCharges}</div>
            </div>
            <div class="small-card">
                <div class="small-card-title">Total Deductions</div>
                <div class="small-card-value">${marketTruckTrips.totalDeductions}</div>
            </div>
            <div class="small-card">
                <div class="small-card-title">Profit</div>
                <div class="small-card-value profit">${marketTruckProfit}</div>
            </div>
        </div>

        <div class="section-title">Own Trucks</div>
        <div class="grid-4">
            <div class="small-card">
                <div class="small-card-title">Total Freight</div>
                <div class="small-card-value">${ownTruckTrips.totalFreight}</div>
            </div>
            <div class="small-card">
                <div class="small-card-title">Total Charges</div>
                <div class="small-card-value">${ownTruckTrips.totalCharges}</div>
            </div>
            <div class="small-card">
                <div class="small-card-title">Total Deductions</div>
                <div class="small-card-value">${ownTruckTrips.totalDeductions}</div>
            </div>
            <div class="small-card">
                <div class="small-card-title">Profit</div>
                <div class="small-card-value profit">${ownTruckProfit}</div>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <div class="card-title">Total Expense</div>
                <div class="card-value expense">₹${totalExpense}</div>
            </div>
            <div class="card">
                <div class="card-title">Office Expense</div>
                <div class="card-value">${totalOfficeExpense}</div>
            </div>
        </div>

        <div class="footer">
  Generated with 
  <img src="https://www.awajahi.com/awajahi%20logo.png" alt="Awajahi logo" class="footer-logo" /> 
  Awajahi.com
</div>

    </div>
</body>
</html>
`;
        await recentActivity('Generated Report', {
            month: month,
            year: year
        }, user)
        return new Response(htmlReport, {
            headers: { 'Content-Type': 'text/html' },
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch trip data', status: 500 });
    }
}
