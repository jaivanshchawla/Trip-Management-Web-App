import { recentActivity } from "@/helpers/recentActivity";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, supplierAccountSchema, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const SupplierAccount = models.SupplierAccount || model('SupplierAccount', supplierAccountSchema);
const Trip = models.Trip || model('Trip', tripSchema);

export async function DELETE(req: Request, { params }: { params: { paymentId: string } }) {
    try {
        // Verify the token and user
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error: 'Unauthorized', status: 401 });
        }

        // Extract the paymentId from params
        const { paymentId } = params;

        // Connect to the database
        await connectToDatabase();

        // Find and delete the SupplierAccount by paymentId
        const account = await SupplierAccount.findByIdAndDelete(paymentId);
        await recentActivity('Deleted Supplier Payment', account, user)

        // Check if the account was found and deleted
        if (!account) {
            return NextResponse.json({ error: 'Payment not found', status: 404 });
        }

        // Update truck hire cost if trip_id is present (reverse the deduction)
        if (account.trip_id) {
            await Trip.findOneAndUpdate(
                { user_id: user, trip_id: account.trip_id },
                { $inc: { truckHireCost: account.amount } }
            );
        }

        // Return the deleted account with a success status
        return NextResponse.json({ payment: account, status: 200 });
    } catch (error) {
        console.error('Error deleting payment:', error);
        // Return an internal server error status
        return NextResponse.json({ error: 'Internal Server Error', status: 500 });
    }
}
