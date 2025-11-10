import { verifyToken } from "@/utils/auth";
import { connectToDatabase, InvoiceSchema, tripSchema } from "@/utils/schema";
import { NextResponse } from "next/server";
import { models, model } from "mongoose";

const Invoice = models.Invoice || model("Invoice", InvoiceSchema);

export async function GET(req : Request, {params} : {params : {invoiceId : string}}){
    try {
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error : 'Unauthorized user'}, {status : 401})
        }
        const {invoiceId} = params

        const invoice = await Invoice.findById(invoiceId)
        return NextResponse.json({invoice}, {status : 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error, status : 500}, {status : 500})
    }
}

export async function PATCH(req: Request, { params }: { params: { invoiceId: string } }) {
    try {
        // Verify user token
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error: 'Unauthorized User', status: 401 });
        }

        const { invoiceId } = params

        // Connect to the database
        await connectToDatabase();

        // Get form data
        const data = await req.json()

        console.log(data)

        // Check if the document type already exists in the documents array

        const invoice = await Invoice.findByIdAndUpdate(invoiceId, data)


        // Return success response
        return NextResponse.json({ message: 'Invoice saved successfully', status: 200 });

    } catch (error) {
        // Log the error and return server error response
        console.error("Error in uploading document:", error);
        return NextResponse.json({ error: 'Failed to upload document', status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { invoiceId: string } }) {
    try {
        // Verify user token
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error: 'Unauthorized User', status: 401 });
        }

        const { invoiceId } = params

        // Connect to the database
        await connectToDatabase();


        const invoice = await Invoice.findByIdAndDelete(invoiceId)

        const Trip = models.Trip || model('Trip', tripSchema)

        await Trip.updateMany(
            { trip_id: { $in: invoice.trips } },
            { $set: { invoice: false, invoice_id : ''} },
        
        );



        // Return success response
        return NextResponse.json({ message: 'Invoice Deleted successfully', status: 200 });

    } catch (error) {
        // Log the error and return server error response
        console.error("Failed to delete invoice:", error);
        return NextResponse.json({ error: 'Failed to delete invoice', status: 500 });
    }
}