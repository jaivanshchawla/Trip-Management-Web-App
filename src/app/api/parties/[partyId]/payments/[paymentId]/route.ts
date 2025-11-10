import { AddtoInvoice } from "@/helpers/modifyInvoice"
import { recentActivity } from "@/helpers/recentActivity"
import { verifyToken } from "@/utils/auth"
import { connectToDatabase, PartyPaymentSchema } from "@/utils/schema"
import { model, models } from "mongoose"
import { NextResponse } from "next/server"

const PartyPayment = models.PartyPayment || model('PartyPayment', PartyPaymentSchema)

export async function PUT(req: Request, { params }: { params: { paymentId: string } }) {
    try {
        // Verify user token
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.redirect('/api/logout');
        }

        // Parse request body
        const data = await req.json();
        const { paymentId } = params;

        // Validate paymentId and data
        if (!paymentId || !data) {
            return NextResponse.json({ error: "Invalid payment ID or data", status: 400 });
        }

        // Connect to the database
        await connectToDatabase();

        // Fetch the previous payment and update it in a single operation
        const prevPayment = await PartyPayment.findById(paymentId);
        if (!prevPayment) {
            return NextResponse.json({ error: "Payment not found", status: 404 });
        }

        const updatedPayment = await PartyPayment.findByIdAndUpdate(paymentId, data, { new: true });

        // Check if trip_id and amount are present and if the amount has changed
        if (updatedPayment.trip_id && updatedPayment.amount && updatedPayment.amount !== prevPayment.amount) {
            const diffAmount = Number(updatedPayment.amount) - Number(prevPayment.amount);
            await AddtoInvoice(updatedPayment.trip_id, user, Number(diffAmount));
        }

        // Log recent activity
        await recentActivity('Updated Party Payment', updatedPayment, user);

        // Return the updated payment
        return NextResponse.json({ payment: updatedPayment, status: 200 });
    } catch (error) {
        console.error("Error in PUT /api/payments/[paymentId]:", error);
        return NextResponse.json({ error: "Internal Server Error", status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { paymentId: string } }) {
    try {
        const { user, error } = await verifyToken(req)
        if (!user || error) {
            return NextResponse.redirect('/api/logout')
        }
        const { paymentId } = params
        await connectToDatabase()
        const payment = await PartyPayment.findByIdAndDelete(paymentId)
        if (payment.trip_id) {
            await AddtoInvoice(payment.trip_id, user, -payment.amount)
        }
        await recentActivity('Deleted Party Payment', payment, user)
        return NextResponse.json({ payment, status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error, status: 500 })
    }
}