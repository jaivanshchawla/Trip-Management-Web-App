
import { uploadFileToS3 } from "@/helpers/fileOperation";
import { recentActivity } from "@/helpers/recentActivity";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, truckSchema, } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Truck = models.Truck || model('Truck', truckSchema)

export async function GET(req: Request, { params }: { params: { truckNo: string } }) {
    try {
        const { user, error } = await verifyToken(req)
        if (!user || error) {
            return NextResponse.json({ error })
        }
        const { truckNo } = params
        await connectToDatabase()
        const truck = await Truck.findOne({ user_id: user, truckNo: truckNo }).select(['truckNo', 'documents']).exec();

        return NextResponse.json({ status: 200, documents: truck.documents })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, error })
    }
}

export async function PUT(req: Request, { params }: { params: { truckNo: string } }) {
    try {
        // Verify user token
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error: 'Unauthorized User', status: 401 });
        }

        const { truckNo } = params;

        // Connect to the database
        await connectToDatabase();

        // Get form data
        const formdata = await req.formData();
        const file = formdata.get('file') as File;
        const docType = formdata.get('docType') as string;
        const validity = new Date(formdata.get('validityDate') as string);
        const filename = formdata.get('filename') as string;

        // Validate form data
        if (!file || !docType || !validity) {
            return NextResponse.json({ error: 'Missing required fields', status: 400 });
        }

        // Find the trip by user and tripId
        const truck = await Truck.findOne({ user_id: user, truckNo: truckNo });
        console.log(truck)
        if (!truck) {
            return NextResponse.json({ error: 'Truck not found', status: 404 });
        }

        // Prepare file for upload to S3
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = `trucks/${truckNo}/${docType}`;
        const contentType = file.type;

        // Upload file to S3
        const s3FileName = await uploadFileToS3(fileBuffer, fileName, contentType);
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3FileName}${contentType === 'application/pdf' ? '.pdf' : ''}`;

        // Check if the document type already exists in the documents array
        const existingDocIndex = truck.documents.findIndex((doc: any) => doc.type === docType);

        let document
        if (existingDocIndex !== -1) {
            // Replace the existing document with the new one
            truck.documents[existingDocIndex] = {
                filename: filename || '',
                type: docType,
                validityDate: validity,
                uploadedDate: new Date(Date.now()),
                url: fileUrl,
            };
            document = truck.documents[existingDocIndex];
        } else {
            // Add new document if not found
            truck.documents.unshift({
                filename: filename || '',
                type: docType,
                validityDate: validity,
                uploadedDate: new Date(),
                url: fileUrl,
            });
            document = truck.documents[0]
        }

        // Save the updated trip document

        await Promise.all([truck.save(), recentActivity('Added Truck Document', {
            truckNo: truckNo,
            filename: filename || '',
            type: docType,
            url: fileUrl,
        }, user)]);

        // Return success response
        return NextResponse.json({ message: 'Document uploaded successfully', status: 200 , document});

    } catch (error) {
        // Log the error and return server error response
        console.error("Error in uploading document:", error);
        return NextResponse.json({ error: 'Failed to upload document', status: 500 });
    }
}
