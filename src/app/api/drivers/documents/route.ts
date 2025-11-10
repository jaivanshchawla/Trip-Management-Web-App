import { verifyToken } from "@/utils/auth";
import { connectToDatabase, driverSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Driver = models.Driver || model('Driver', driverSchema);

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
        const drivers = await Driver.aggregate([
            {
                $match: { user_id: user } // Match the user_id with the user
            },
            {
                $project: {
                    user_id: 1,
                    driver_id: 1,
                    name: 1,
                    contactNumber: 1,
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
                $match: { 'documents.0': { $exists: true } } // Only return drivers with matching documents
            }
        ]);

        // Format the result to combine driver info with each document
        const formattedDocs = drivers.flatMap((driver: any) => 
            driver.documents.map((doc: any) => ({
                filename: doc.filename,
                type: doc.type,
                validityDate: doc.validityDate,
                uploadedDate: doc.uploadedDate,
                url: doc.url,
                user_id: driver.user_id,
                driver_id: driver.driver_id,
                name: driver.name,
                contactNumber: driver.contactNumber
            }))
        );

        // Return the formatted documents
        return NextResponse.json({documents : formattedDocs, status : 200});

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Something went wrong', status: 500 });
    }
}
