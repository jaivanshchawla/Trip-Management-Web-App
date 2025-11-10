import { verifyToken } from "@/utils/auth";
import { connectToDatabase, supplierAccountSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const SupplierAccount = models.SupplierAccount || model('SupplierAccount', supplierAccountSchema)

export async function GET(req: Request, { params }: { params: { supplierId: string, tripId: string } }) {
    try {
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error });
        }

        const { supplierId, tripId } = params;
        await connectToDatabase();
        const supplierAccounts = await SupplierAccount.find({ user_id: user, supplier_id: supplierId, trip_id: tripId }).lean();

        const totalAmount = supplierAccounts.reduce((sum, account) => sum + account.amount, 0);

        return NextResponse.json({ status: 200, totalAmount, supplierAccounts });
    } catch (error: any) {
        console.error('Error saving supplier account:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' });
    }
}
