import { verifyToken } from "@/utils/auth";
import { connectToDatabase, userSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";
const User = models.User || model('User', userSchema)

export async function DELETE(req : Request, {params} : {params : {userId : string}}) {
    try {
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error : 'Authentication Failed', status : 401})
        }
        const {userId} = params
        await connectToDatabase()
        await User.findOneAndDelete({user_id : userId})
        return NextResponse.json({message : 'Access Revoked', status : 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error , status : 500})
    }
}