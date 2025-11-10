import { verifyToken } from "@/utils/auth";
import { connectToDatabase, supplierAccountSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const SupplierAccount = models.SupplierAccount || model('SupplierAccount', supplierAccountSchema)

export async function GET(req: Request, { params }: { params: { supplierId: string } }) {
    try {
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error });
        }

        const { supplierId } = params;
        await connectToDatabase();

        // Calculate the total balance from supplier accounts
        const result = await SupplierAccount.aggregate([
            {
                $match: { user_id: user, supplier_id: supplierId }
            },
            {
                $group: {
                    _id: null,
                    totalBalance: { $sum: '$amount' }
                }
            }
        ]);

        const balance = result.length > 0 ? result[0].totalBalance : 0;

        return NextResponse.json({ balance });
    } catch (error: any) {
        console.error('Error calculating supplier balance:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' });
    }
}
