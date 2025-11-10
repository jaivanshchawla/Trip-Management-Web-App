import {models, model} from 'mongoose'
import { connectToDatabase, ShopKhataSchema } from '@/utils/schema';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';
import {v4 as uuidv4} from 'uuid'

const ShopKhata = models.ShopKhata || model('ShopKhata', ShopKhataSchema)

export async function GET(req : Request, {params} : {params : {shopId : string}}){
    try{
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error : "Unauthorized User", status : 401})
        }
        const {shopId} = params
        await connectToDatabase()
        const shop = await ShopKhata.findOne({user_id : user, shop_id : shopId})
        return NextResponse.json({shop, status : 200})
    }catch(error){
        console.log(error)
        return NextResponse.json({error, status : 500})
    }
}
