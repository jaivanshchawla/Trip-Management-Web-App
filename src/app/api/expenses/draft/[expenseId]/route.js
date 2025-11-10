
import { uploadFileToS3 } from "@/helpers/fileOperation";
import { recentActivity } from "@/helpers/recentActivity";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, draftExpenseSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const DraftExpense = models.DraftExpense || model('DraftExpense', draftExpenseSchema);

export async function DELETE(req: Request, { params }: { params: { expenseId: string } }) {
  const { user, error } = await verifyToken(req);
  if (error) {
    return NextResponse.json({ error });
  }

  const { expenseId } = params

  await connectToDatabase()
  try {
    const charge = await DraftExpense.findByIdAndDelete(expenseId)
    if (!charge) {
      return NextResponse.json({ status: 404, message: "Charge Not Found" })
    }
    return NextResponse.json({ message: 'Deletion Success', status: 200, expense: charge })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: error, status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { expenseId: string } }) {
  // Connect to the database
  await connectToDatabase();
  const { expenseId } = params

  // Extract the tripId from the request params

  try {
    const { user, error } = await verifyToken(req);
    if (error) {
      return NextResponse.json({ error });
    }
    const formdata = await req.formData()
    const file = formdata.get('file') as File
    const expenseData = JSON.parse(formdata.get('expense') as string);
    await connectToDatabase()

    // Create a new instance of TripExpense with the parsed data and tripId
    const charge = await DraftExpense.findByIdAndUpdate(expenseId, expenseData, { new: true })
    if (file) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileName = `expenses/${charge._id}`;
      const contentType = file.type;

      // Upload file to S3
      const s3FileName = await uploadFileToS3(fileBuffer, fileName, contentType);
      const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3FileName}${contentType === 'application/pdf' ? '.pdf' : ''}`;
      charge.url = fileUrl;
    }
    await Promise.all([charge.save(), recentActivity('Edited Draft Expense', charge, user)])
    console.log(charge)
    // Return a success response with the new charge
    return NextResponse.json({ status: 200, expense: charge });

  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error creating new trip expense:", error);
    return NextResponse.json({ status: 500, error: "Failed to edit expense" });
  }
}