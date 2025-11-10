import { uploadFileToS3 } from "@/helpers/fileOperation";
import { recentActivity } from "@/helpers/recentActivity";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Trip = models.Trip || model('Trip', tripSchema);

export async function GET(req: Request, { params }: { params: { tripId: string } }) {
    try {
        const { user, error } = await verifyToken(req)
        if (!user || error) {
            return NextResponse.json({ error })
        }
        const { tripId } = params
        await connectToDatabase()
        const trip = await Trip.findOne({ user_id: user, trip_id: tripId }).select(['trip_id', 'documents', 'route', 'startDate']).exec();
        return NextResponse.json({ status: 200, documents: trip.documents })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, error })
    }
}

export async function PUT(req: Request, { params }: { params: { tripId: string } }) {
    try {
        // Verify user token
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error: 'Unauthorized User', status: 401 });
        }

        const { tripId } = params;

        // Connect to the database
        await connectToDatabase();

        // Get form data
        const formdata = await req.formData();
        const file = formdata.get('file') as File;
        const docType = formdata.get('docType') as string;
        const validity = new Date(formdata.get('validityDate') as string) || null;
        const filename = formdata.get('filename') as string;

        // Validate form data
        if (!file || !docType || !validity) {
            return NextResponse.json({ error: 'Missing required fields', status: 400 });
        }

        // Find the trip by user and tripId
        const trip = await Trip.findOne({ user_id: user, trip_id: tripId });
        if (!trip) {
            return NextResponse.json({ error: 'Trip not found', status: 404 });
        }

        // Prepare file for upload to S3
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = `trips/${docType}-${tripId}`;
        const contentType = file.type;

        // Upload file to S3
        const s3FileName = await uploadFileToS3(fileBuffer, fileName, contentType);
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3FileName}${contentType === 'application/pdf' ? '.pdf' : ''}`;

        // Check if the document type already exists in the documents array
        const existingDocIndex = trip.documents.findIndex((doc: any) => doc.type === docType);

        if (existingDocIndex !== -1) {
            // Replace the existing document with the new one
            trip.documents[existingDocIndex] = {
                filename: filename || '',
                type: docType,
                validityDate: validity,
                uploadedDate: new Date(Date.now()),
                url: fileUrl,
            };
        } else {
            // Add new document if not found
            trip.documents.push({
                filename: filename || '',
                type: docType,
                validityDate: validity,
                uploadedDate: new Date(),
                url: fileUrl,
            });
        }

        // Save the updated trip document
        await Promise.all([trip.save(), recentActivity('Added Trip Document', {
            trip_id: tripId,
            filename: filename || '',
            type: docType,
            url: fileUrl,
        }, user)]);

        // Return success response
        return NextResponse.json({ documents: trip.documents, message: 'Document uploaded successfully', status: 200 });

    } catch (error) {
        // Log the error and return server error response
        console.error("Error in uploading document:", error);
        return NextResponse.json({ error: 'Failed to upload document', status: 500 });
    }
}
