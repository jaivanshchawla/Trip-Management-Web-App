import { verifyToken } from "@/utils/auth";
import { NextResponse } from "next/server";
import { models, model } from 'mongoose';
import { driverSchema, tripSchema, truckSchema } from "@/utils/schema";

// Abstract common logic for reminders
async function fetchReminders(modelName,
    schema,
    userId,
    projectionFields
) {
    const Model = models[modelName] || model(modelName, schema);

    const oneWeekAgo = new Date();
    const oneWeekFromNow = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Past one week
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7); // Upcoming one week

    return Model.aggregate([ { $match: { user_id: userId } }, { $unwind: "$documents" }, {
            $match: {
                "documents.validityDate": { $gte: oneWeekAgo, $lte: oneWeekFromNow }, // Expired or expiring
            }
        }, {
            $project: {
                ...projectionFields,
                "documents.filename": 1,
                "documents.type": 1,
                "documents.validityDate": 1,
                "documents.uploadedDate": 1,
                "documents.url": 1,
            }
        }
    ]);
}

// Fetch trip reminders
const TripReminders = (userId) =>
    fetchReminders("Trip", tripSchema, userId, {
        trip_id: 1,
        LR: 1,
        truck: 1,
        startDate: 1,
    });

// Fetch truck reminders
const TruckReminders = (userId) =>
    fetchReminders("Truck", truckSchema, userId, {
        truckNo: 1,
    });

// Fetch driver reminders
const DriverReminders = (userId) =>
    fetchReminders("Driver", driverSchema, userId, {
        name: 1,
        contactNumber: 1,
    });

export async function GET(req) {
    try {
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error: "Unauthorized user" }, { status: 401 });
        }

        // Parallel execution for efficiency
        const [tripReminders, truckReminders, driverReminders] = await Promise.all([
            TripReminders(user),
            TruckReminders(user),
            DriverReminders(user),
        ]);

        return NextResponse.json({
            tripReminders,
            truckReminders,
            driverReminders,
        });
    } catch (error) {
        console.error("Error fetching reminders:", error);
        return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 }
        );
    }
}
