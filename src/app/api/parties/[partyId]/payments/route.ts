import { AddtoInvoice } from "@/helpers/modifyInvoice";
import { recentActivity } from "@/helpers/recentActivity";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, InvoiceSchema, PartyPaymentSchema, tripSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const PartyPayment = models.PartyPayment || model('PartyPayment', PartyPaymentSchema)


export async function POST(req: Request, { params }: { params: { partyId: string } }) {

    try {
        const { user, error } = await verifyToken(req)
        if (!user || error) {
            return NextResponse.redirect('/api/logout')
        }
        const data = await req.json()
        const { partyId } = params
        await connectToDatabase()
        const payment = new PartyPayment({
            user_id: user,
            party_id: partyId,
            ...data
        })
        if (data.trip_id && data.amount) {
            await AddtoInvoice(data.trip_id, user, Number(data.amount))
        }
        await Promise.all([payment.save(), recentActivity('Added Party Payment', payment, user)])
        return NextResponse.json({ payment, status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error, status: 500 })
    }
}