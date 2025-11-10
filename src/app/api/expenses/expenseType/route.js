import { verifyToken } from "@/utils/auth";
import { userExpenseTypesSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const UserExpenseType = models.UserExpenseType || model("UserExpenseType", userExpenseTypesSchema)

export async function GET(req : Request){
    try {
        const {user, error} = await verifyToken(req)
        if (!user|| error){
            return NextResponse.json({error : 'Unauthorized User', status : 401})
        }
        const userdata = await UserExpenseType.findOne({user_id : user})
        return NextResponse.json({expenseTypes : userdata.expenseTypes, status : 200}, {status : 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error : 'Internal Server Error', status : 500})
    }
}

export async function POST(req : Request){
    try {
        const {user, error} = await verifyToken(req)
        if (!user|| error){
            return NextResponse.json({error : 'Unauthorized User', status : 401})
        }
        const data = await req.json()
        let userdata = await UserExpenseType.findOne({user_id : user})
        if(!userdata){
            userdata = await new UserExpenseType({user_id : user, expenseTypes : [data.expenseType]})
        }else{
            userdata.expenseTypes.unshift(data.expenseType)
        }
        
        await userdata.save()
        return NextResponse.json({expenseTypes : userdata.expenseTypes, status : 200}, {status : 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error : 'Internal Server Error', status : 500})
    }
}