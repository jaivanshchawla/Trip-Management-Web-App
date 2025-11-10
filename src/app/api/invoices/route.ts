import { verifyToken } from "@/utils/auth";
import { connectToDatabase, InvoiceSchema, tripSchema } from "@/utils/schema";
import { NextResponse } from "next/server";
import { models, model } from "mongoose";
import { recentActivity } from "@/helpers/recentActivity";

const Invoice = models.Invoice || model("Invoice", InvoiceSchema);

export async function GET(req: Request) {
    try {
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
        }

        await connectToDatabase()

        const debugPipeline = [
            { $match: { user_id: user } },
            {
                $lookup: {
                    from: "parties",
                    localField: "party_id",
                    foreignField: "party_id",
                    as: "partyDetails",
                },
            },
            { $unwind: { path: "$partyDetails", preserveNullAndEmptyArrays: true } }, // Ensure null values are preserved for debugging
            {
                $addFields: {
                    partyName: "$partyDetails.name",
                },
            },
            {
                $project: {
                    partyDetails: 0,
                },
            },
        ];

        const invoices = await Invoice.aggregate(debugPipeline);

        return NextResponse.json({ invoices }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Verify user token
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error: 'Unauthorized User', status: 401 });
        }

        // Connect to the database
        await connectToDatabase();

        // Get form data
        const data = await req.json()



        // Check if the document type already exists in the documents array

        const invoices = await Invoice.find({ user_id: user })

        const newInvoice = new Invoice({
            user_id: user,
            invoiceNo: invoices.length + 1,
            date: new Date(data?.date),
            dueDate: new Date(data?.dueDate),
            route: data.route,
            party_id: data.party_id,
            trips: data?.trips,
            balance: data.balance,
            invoiceStatus: data?.invoiceStatus,
            total: data?.total,
            advance: data?.advance
        })

        await Promise.all([newInvoice.save(), recentActivity('Generated Invoice', newInvoice, user)]);

        const Trip = models.Trip || model('Trip', tripSchema)

        await Trip.updateMany(
            { trip_id: { $in: data.trips } },
            { $set: { invoice: true, invoice_id: newInvoice._id } }
        );

        // Save the updated trip document


        // Return success response
        return NextResponse.json({ message: 'Document uploaded successfully', status: 200 });

    } catch (error) {
        // Log the error and return server error response
        console.error("Error in uploading document:", error);
        return NextResponse.json({ error: 'Failed to upload document', status: 500 });
    }
}
