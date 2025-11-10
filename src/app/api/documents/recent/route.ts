import { verifyToken } from "@/utils/auth";
import { connectToDatabase, driverSchema, otherDocumentsSchema, tripSchema, truckSchema, userSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

// Initialize models if they don't exist
const Trip = models.Trip || model('Trip', tripSchema);
const Driver = models.Driver || model('Driver', driverSchema);
const Truck = models.Truck || model('Truck', truckSchema);
const User = models.User || model('User', userSchema);
const OtherDocuments = models.OtherDocuments || model('OtherDocuments', otherDocumentsSchema);

export async function GET(req: Request) {
    try {
        // Verify the user
        const { user, error } = await verifyToken(req);
        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized User', status: 401 });
        }

        // Connect to the database
        await connectToDatabase();

        // Use Promise.all for parallel queries
        const [tripResults, driverResults, truckResults, userResults, otherResults] = await Promise.all([
            Trip.aggregate([
                { $match: { user_id: user } },
                { $project: { documents: 1 } },
                { $unwind: { path: "$documents", preserveNullAndEmptyArrays: true } },
                { $sort: { "documents.uploadedDate": -1 } },
                { $limit: 5 }
            ]),
            Driver.aggregate([
                { $match: { user_id: user } },
                { $project: { documents: 1 } },
                { $unwind: { path: "$documents", preserveNullAndEmptyArrays: true } },
                { $sort: { "documents.uploadedDate": -1 } },
                { $limit: 5 }
            ]),
            Truck.aggregate([
                { $match: { user_id: user } },
                { $project: { documents: 1 } },
                { $unwind: { path: "$documents", preserveNullAndEmptyArrays: true } },
                { $sort: { "documents.uploadedDate": -1 } },
                { $limit: 5 }
            ]),
            User.aggregate([
                { $match: { user_id: user } },
                { $project: { documents: 1 } },
                { $unwind: { path: "$documents", preserveNullAndEmptyArrays: true } },
                { $sort: { "documents.uploadedDate": -1 } },
                { $limit: 5 }
            ]),
            OtherDocuments.aggregate([
                { $match: { user_id: user } },
                { $sort: { uploadedDate: -1 } },
                { $limit: 5 }
            ])
        ]);

        // Combine and get the latest 5 documents across all collections
        const allDocuments = [...tripResults, ...driverResults, ...truckResults, ...userResults, ...otherResults]
            .map(doc => doc.documents || doc) // Ensure consistent structure for "documents"
            .sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime())
            .slice(0, 5);

        // Count documents for each collection
        const [tripDocumentsCount, driverDocumentsCount, truckDocumentsCount, userDocumentsCount, otherDocumentsCount] = await Promise.all([
            Trip.aggregate([
                { $match: { user_id: user } },
                { $project: { documents: { $ifNull: ["$documents", []] } } }, // Ensure documents field exists
                { $group: { _id: null, count: { $sum: { $size: "$documents" } } } } // Sum up the sizes of the documents array
            ]).then(res => res[0]?.count || 0),

            Driver.aggregate([
                { $match: { user_id: user } },
                { $project: { documents: { $ifNull: ["$documents", []] } } },
                { $group: { _id: null, count: { $sum: { $size: "$documents" } } } }
            ]).then(res => res[0]?.count || 0),

            Truck.aggregate([
                { $match: { user_id: user } },
                { $project: { documents: { $ifNull: ["$documents", []] } } },
                { $group: { _id: null, count: { $sum: { $size: "$documents" } } } }
            ]).then(res => res[0]?.count || 0),

            User.aggregate([
                { $match: { user_id: user } },
                { $project: { documents: { $ifNull: ["$documents", []] } } },
                { $group: { _id: null, count: { $sum: { $size: "$documents" } } } }
            ]).then(res => res[0]?.count || 0),

            OtherDocuments.aggregate([
                { $match: { user_id: user } },
                { $count: "count" } // Directly count documents matching the condition
            ]).then(res => res[0]?.count || 0)
        ]);


        // Return the latest 5 documents along with document counts
        return NextResponse.json({
            documents: allDocuments,
            counts: {
                tripDocuments: tripDocumentsCount,
                driverDocuments: driverDocumentsCount,
                truckDocuments: truckDocumentsCount,
                companyDocuments: userDocumentsCount,
                otherDocuments: otherDocumentsCount
            },
            status: 200
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Internal Server Error', status: 500 });
    }
}
