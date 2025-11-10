import { verifyToken } from "@/utils/auth";
import { connectToDatabase, truckSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Truck = models.Truck || model('Truck', truckSchema);

export async function GET(req: Request) {
    try {
        // Verify user token
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error: 'Unauthorized User', status: 401 });
        }

        // Extract 'type' from query parameters
        const url = new URL(req.url);
        const documentType = url.searchParams.get('type');

        // Ensure 'type' is provided
        if (!documentType) {
            return NextResponse.json({ error: 'Document type is required', status: 400 });
        }

        // Connect to the database
        await connectToDatabase();

        // Use aggregation to filter documents directly in MongoDB
        const trucks = await Truck.aggregate([
            {
                $match: { user_id: user } // Match the user_id with the user
            },
            {
                $project: {
                    user_id: 1,
                    truckNo: 1,
                    truckType: 1,
                    documents: {
                        $filter: {
                            input: '$documents',
                            as: 'document',
                            cond: { $eq: ['$$document.type', documentType] }
                        }
                    }
                }
            },
            {
                $match: { 'documents.0': { $exists: true } } // Only return trucks with matching documents
            }
        ]);

        // Format the result to combine truck info with each document
        const formattedDocs = trucks.flatMap((truck: any) =>
            truck.documents.map((doc: any) => ({
                filename: doc.filename,
                type: doc.type,
                validityDate: doc.validityDate,
                uploadedDate: doc.uploadedDate,
                url: doc.url,
                user_id: truck.user_id,
                truckNo: truck.truckNo,
                truckType: truck.truckType
            }))
        );

        // Return the formatted documents
        return NextResponse.json({ documents: formattedDocs, status: 200 });

    } catch (error) {
        console.error('Error fetching truck documents:', error);
        return NextResponse.json({ error: 'Something went wrong', status: 500 });
    }
}