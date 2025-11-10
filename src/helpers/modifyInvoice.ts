import { tripSchema, InvoiceSchema } from "@/utils/schema";
import { models, model } from "mongoose";

export async function AddtoInvoice(tripId: string, userId: string, amount: number) {

    const Trip = models.Trip || model('Trip', tripSchema)
    const Invoice = models.Invoice || model('Invoice', InvoiceSchema)

    try {
        // Validate inputs

        // console.log(tripId, amount, userId)
        // console.log(typeof(amount))

        if (!tripId || !userId || typeof amount !== "number") {
            throw new Error("Invalid input parameters");
        }

        // Find the trip
        const trip = await Trip.findOne({ user_id: userId, trip_id: tripId });
        if (!trip) {
            throw new Error("Trip not found");
        }

        // If the trip already has an invoice_id, update the existing invoice
        if (trip.invoice_id) {
            const invoice = await Invoice.findByIdAndUpdate(
                trip.invoice_id,
                {
                    $inc: { advance: amount, balance: -amount }, // Use $inc to increment/decrement
                },
                { new: true } // Return the updated document
            );

            if (!invoice) {
                throw new Error("Invoice not found");
            }
        }
    } catch (error) {
        console.error("Error in AddtoInvoice:", error);
        // Re-throw the error for the caller to handle
    }
}
