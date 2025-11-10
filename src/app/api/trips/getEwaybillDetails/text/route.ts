import { extractEWayBillDetails } from "@/helpers/TripOperation";
import { verifyToken } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function POST(req:Request) {
    try {
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error : 'Unauthorized User', status : 401})
        }
        const text = await req.text()
        const ewaybillDetails = await extractEWayBillDetails(text)
        return NextResponse.json({success : true,ewbValidityDate :  ewaybillDetails, status : 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error : 'Internal Server Error', status : 500})
    }
}