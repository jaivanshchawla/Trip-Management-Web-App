import { verifyToken } from "@/utils/auth";
import { connectToDatabase, truckSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Truck = models.Truck || model('Truck', truckSchema)

export async function POST(req: Request, { params }: { params: { supplierId: string } }) {
    try {
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error });
        }

        const { supplierId } = params;
        const { paymentAmount } = await req.json();
        await connectToDatabase();

        // Update truck hire current for all trucks of the supplier
        const updateResult = await Truck.updateMany(
            { user_id: user, supplier: supplierId },
            { $inc: { truckHireCurrent: paymentAmount } }
        );

        if (updateResult.modifiedCount > 0) {
            return NextResponse.json({ success: true, message: 'Truck hire updated successfully' });
        } else {
            return NextResponse.json({ success: false, message: 'No trucks found for the supplier' });
        }
    } catch (error: any) {
        console.error('Error updating truck hire:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' });
    }
}
