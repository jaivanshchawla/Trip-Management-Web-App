import { verifyToken } from "@/utils/auth";
import { ShopKhataAccountsSchema } from "@/utils/schema";
import { NextResponse } from "next/server";
import { models, model } from 'mongoose'


const ShopKhataAccounts = models.ShopKhataAccounts || model('ShopKhataAccounts', ShopKhataAccountsSchema);

export async function PATCH(req: Request, { params }: { params: { shopId: string, accountId: string } }) {

}

export async function DELETE(req: Request, { params }: { params: { shopId: string, accountId: string } }) {
    try {
        const { user, error } = await verifyToken(req)
        if (!user || error) {
            return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 })
        }
        const { shopId, accountId } = params
        await ShopKhataAccounts.findByIdAndDelete(accountId)

        return NextResponse.json({ message: 'Entry Deleted' }, { status: 200 })

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error, status: 500 }, { status: 500 })
    }
}