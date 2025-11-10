import { models, model } from 'mongoose'
import { connectToDatabase, ShopKhataSchema } from '@/utils/schema';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'
import { recentActivity } from '@/helpers/recentActivity';

const ShopKhata = models.ShopKhata || model('ShopKhata', ShopKhataSchema)

export async function GET(req: Request) {
    try {
        const { user, error } = await verifyToken(req)
        if (!user || error) {
            return NextResponse.json({ error: "Unauthorized User", status: 401 })
        }
        await connectToDatabase()
        // const shops = await ShopKhata.find({ user_id: user })
        const shops = await ShopKhata.aggregate([
            {
                $match: { user_id: user }
            },
            {
                $lookup: {
                    from: 'shopkhataaccounts',
                    localField: 'shop_id',
                    foreignField: 'shop_id',
                    as: 'shopKhataAccounts'
                }
            },
            {
                $lookup: {
                    from: 'expenses',
                    localField: 'shop_id',
                    foreignField: 'shop_id',
                    as: 'expenses'
                }
            },

            {
                $lookup: {
                    from: 'officeexpenses',
                    localField: 'shop_id',
                    foreignField: 'shop_id',
                    as: 'officeexpenses'
                }
            },
            {
                $addFields: {
                    totalExpenses: {
                        $sum: '$expenses.amount' // Summing the total expenses amount
                    },
                    totalCredit: {
                        $sum: '$shopKhataAccounts.credit' // Summing the total credit from shopKhataAccounts
                    },
                    totalPayment: {
                        $sum: '$shopKhataAccounts.payment' // Summing the total payments from shopKhataAccounts
                    },
                    totalOfficeExpense: {
                        $sum: '$officeexpenses.amount'
                    }
                }
            },
            {
                $addFields: {
                    balance: {
                        $subtract: [
                            '$totalPayment',
                            { $add: ['$totalCredit', '$totalExpenses', '$totalOfficeExpense'] }, // Subtract total credit
                        ]
                    }
                }
            }
        ]);


        return NextResponse.json({ shops, status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error, status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const { user, error } = await verifyToken(req)
        if (!user || error) {
            return NextResponse.json({ error: "Unauthorized User", status: 401 })
        }
        const data = await req.json()
        await connectToDatabase()
        const shopId = 'shop' + uuidv4()
        const newShop = new ShopKhata({
            shop_id: shopId,
            user_id: user,
            ...data
        })
        await Promise.all([newShop.save(), recentActivity('Added New Shop', newShop, user)])
        return NextResponse.json({ newShop, status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error, status: 500 })
    }
}