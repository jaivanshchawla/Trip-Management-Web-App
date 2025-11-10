import { uploadFileToS3 } from "@/helpers/fileOperation";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, otherDocumentsSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";
import { v4 as uuidV4 } from 'uuid'

const OtherDocuments = models.OtherDocuments || model('OtherDocuments', otherDocumentsSchema);


export async function GET(req: Request) {
  try {
    // Verify user token
    const { user, error } = await verifyToken(req);

    if (!user || error) {
      throw new Error('Unauthorized user');
    }

    // Fetch documents for the user
    await connectToDatabase()
    const documents = await OtherDocuments.find({ user_id: user });
    return NextResponse.json({
      status: 200,
      documents,
    });
  } catch (error: any) {
    console.error('Error fetching documents:', error);

    // Handle unauthorized user
    if (error.message === 'Unauthorized user') {
      const response = NextResponse.json({
        status: 401,
        error: 'Unauthorized',
      });

      // Remove the auth_token cookie
      response.cookies.set('auth_token', '', { maxAge: 0 });
      return response;
    }

    // Handle internal server error
    return NextResponse.json({
      status: 500,
      error: 'Internal Server Error',
    });
  }
}

export async function POST(req: Request) {
  try {
    // Verify user token
    const { user, error } = await verifyToken(req);

    if (!user || error) {
      throw new Error('Unauthorized user');
    }
    await connectToDatabase()

    // Parse form data
    const formData = await req.formData();
    const filesData = JSON.parse(formData.get('filesData') as string);

    const uploadedDocuments = [];

    for (const fileData of filesData) {
      const file = formData.get(`file-${fileData.id}`) as File;

      if (!file) {
        throw new Error(`File not found for id: ${fileData.id}`);
      }

      // Prepare file for S3 upload
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileName = `users/${user}/${uuidV4()}`;
      const contentType = file.type;

      // Upload file to S3
      const s3FileName = await uploadFileToS3(fileBuffer, fileName, contentType);
      const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3FileName}${contentType === 'application/pdf' ? '.pdf' : ''}`;

      // Create a new document record
      const newDocument = new OtherDocuments({
        user_id: user,
        filename: fileData.filename || file.name, // Use custom filename if provided
        url: fileUrl,
        uploadedDate: new Date(Date.now()),
        validityDate: fileData.validityDate || null,
      });

      await newDocument.save();
      uploadedDocuments.push(newDocument);
    }

    // Return the newly created documents
    return NextResponse.json({
      status: 200,
      message: `${uploadedDocuments.length} document(s) uploaded successfully`,
      documents: uploadedDocuments
    });
  } catch (error: any) {
    console.error('Error uploading document(s):', error);

    // Handle unauthorized user
    if (error.message === 'Unauthorized user') {
      return NextResponse.json({
        status: 401,
        error: 'Unauthorized',
      });
    }

    // Handle other errors
    return NextResponse.json({
      status: 500,
      error: 'Internal Server Error',
    });
  }
}
