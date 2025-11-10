import { NextResponse } from 'next/server';
import mongoose, { model, models } from 'mongoose';
import { connectToDatabase, truckSchema } from '@/utils/schema';
import { verifyToken } from '@/utils/auth';
import { v4 as uuidv4 } from 'uuid'
import { validateTruckNo } from '@/utils/validate';
import { recentActivity } from '@/helpers/recentActivity';


const Truck = models.Truck || model('Truck', truckSchema);

export async function GET(req: Request) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }
  try {
    await connectToDatabase()
    const trucks = await Truck.aggregate([
      {
        $match: { user_id: user }, // Filter trucks by user_id
      },
      {
        // Optimize supplier lookup to only return necessary fields
        $lookup: {
          from: 'suppliers',
          localField: 'supplier',
          foreignField: 'supplier_id',
          pipeline: [
            { $project: { name: 1 } }, // Only get the supplier name
          ],
          as: 'suppliers',
        },
      },
      {
        // Optimize driver lookup to only return necessary fields
        $lookup: {
          from: 'drivers',
          localField: 'driver_id',
          foreignField: 'driver_id',
          pipeline: [
            { $project: { name: 1 } }, // Only get the driver name
          ],
          as: 'drivers',
        },
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
                    { $eq: ['$truck', '$$truckNo'] }, // Match truckNo
                    { $eq: ['$user_id', '$$userId'] } // Match user_id
                  ]
                }
              }
            }, // Return relevant fields
          ],
          as: 'trips',
        },
      },
      
      {
        $unwind: {
          path: '$trips',
          preserveNullAndEmptyArrays: true, // Allow trucks with no trips
        },
      },
      {
        // Optimize party lookup for trips, only fetching necessary fields
        $lookup: {
          from: 'parties',
          localField: 'trips.party',
          foreignField: 'party_id',
          pipeline: [
            { $project: { name: 1 } }, // Only get the party name
          ],
          as: 'partyDetails',
        },
      },
      {
        $unwind: {
          path: '$partyDetails',
          preserveNullAndEmptyArrays: true, // Handle trips without party data
        },
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
          supplierName: { $first: { $arrayElemAt: ['$suppliers.name', 0] } },
          driverName: { $first: { $arrayElemAt: ['$drivers.name', 0] } }, // Extract driver name
          supplier: { $first: '$supplier' },
          trips: {
            $push: {
              trip_id: '$trips.trip_id',
              partyName: '$partyDetails.name',
              route: '$trips.route',
              startDate: '$trips.startDate',
              status: '$trips.status',
            },
          },
        },
      },
      {
        $addFields: {
          trips: {
            $sortArray: { input: '$trips', sortBy: { startDate: -1 } }, // Sort trips by startDate descending
          },
        },
      },
      {
        $addFields: {
          latestTrip: {
            $arrayElemAt: ['$trips', 0], // Extract the latest trip after sorting
          },
        },
      },
      {
        $sort: { 'latestTrip.startDate': -1 }, // Sort trucks by latest trip date
      },
      {
        $project: {
          trips: 0
        }
      }
    ]);



    return NextResponse.json({ trucks });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  const { user, error } = await verifyToken(req); // Authenticate the user

  if (error) {
    return NextResponse.json({ status: "error", message: error }, { status: 401 });
  }

  try {
    await connectToDatabase(); // Ensure DB connection

    const data = await req.json(); // Parse request body

    // Validation
    if (!validateTruckNo(data.truckNo)) {
      return NextResponse.json({ status: "error", message: "Enter a valid Truck No" }, { status: 400 });
    }
    if (!data.truckNo || !data.ownership) {
      return NextResponse.json({
        status: "error",
        message: data.truckNo ? "Ownership type is required" : "Truck Number is required"
      }, { status: 400 });
    }
    if (data.ownership === "Market" && !data.supplier) {
      return NextResponse.json({ status: "error", message: "Supplier is required for Market ownership" }, { status: 400 });
    }

    // Check for existing truck
    const existingTruck = await Truck.findOne({ user_id: user, truckNo: data.truckNo.toUpperCase() });
    if (existingTruck) {
      return NextResponse.json({ status: "error", message: "Lorry Already Exists" }, { status: 400 });
    }

    // External API request
    let truckData = {};
    try {
      const res = await fetch("https://api.invincibleocean.com/invincible/vehicleRcV6", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          secretKey: process.env.INVINCIBLE_SECRET_KEY as string,
          clientId: process.env.INVINCIBLE_CLIENT_ID as string,
        },
        body: JSON.stringify({ vehicleNumber: data.truckNo.toUpperCase() }),
      });
      const resData = await res.json();
      truckData = resData.result?.data || {};
    } catch (apiError) {
      console.error("External API error:", apiError);
    }

    // Create a new truck
    const newTruck = new Truck({
      user_id: user,
      truck_id: "truck_id" + uuidv4(),
      truckNo: data.truckNo.toUpperCase(),
      truckType: data.truckType || "",
      model: data.model || "",
      capacity: data.capacity || "",
      bodyLength: data.bodyLength || null,
      ownership: data.ownership,
      supplier: data.supplier || "",
      status: "Available",
      trip_id: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      driver_id: data.driver || "",
      data : truckData,
    });

    await Promise.all([
      newTruck.save(),
      recentActivity("Added New Lorry", newTruck, user),
    ]);


    return NextResponse.json({ status: "success", data: newTruck });
  } catch (err: any) {
    console.error("Error creating truck:", err);
    return NextResponse.json({ status: "error", message: err.message || "Failed to add lorry" }, { status: 500 });
  }
}
