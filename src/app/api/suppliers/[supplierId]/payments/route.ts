import { recentActivity } from "@/helpers/recentActivity";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, supplierAccountSchema, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const SupplierAccount = models.SupplierAccount || model('SupplierAccount', supplierAccountSchema)
const Trip = models.Trip || model('Trip', tripSchema)

export async function POST(req: Request, { params }: { params: { supplierId: string } }) {
    try {
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error });
        }

        const { supplierId } = params;
        const payments = await req.json(); // Assuming the body is an array of payments
        await connectToDatabase();

        const savedPayments = [];
        for (const payment of payments) {
            const supplierAccount = new SupplierAccount({
                user_id: user, // Assuming user contains an id property
                supplier_id: supplierId,
                ...payment
            });
            const savedPayment = await supplierAccount.save();
            savedPayments.push(savedPayment);

            // Update truck hire cost if trip_id is present
            if (payment.trip_id) {
                await Trip.findOneAndUpdate(
                    { user_id: user, trip_id: payment.trip_id },
                    { $inc: { truckHireCost: -payment.amount } }
                );
            }
        }
        await recentActivity('Added Supplier Payment', {
            supplier_id : supplierId
        }, user);
        return NextResponse.json({ success: true, payments: savedPayments });
    } catch (error: any) {
        console.error('Error saving supplier account:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' });
    }
}


export async function GET(req: Request, { params }: { params: { supplierId: string } }) {
    try {
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error });
        }

        const { supplierId } = params;
        await connectToDatabase();
        const supplierAccounts = await SupplierAccount.find({user_id : user, supplier_id : supplierId}).lean()

        return NextResponse.json({ status : 200, supplierAccounts });
    } catch (error: any) {
        console.error('Error saving supplier account:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' });
    }
}

