import { verifyToken } from "@/utils/auth";
import { connectToDatabase, partySchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Party = models.Party || model('Party', partySchema)

export async function GET(req : Request) {
    const { user, error } = await verifyToken(req);
    if (error) {
      return NextResponse.json({ error });
    }
    
  
    try {
      await connectToDatabase()
  
      const parties = await Party.find({user_id : user}).select(['name', 'party_id']).lean().exec();
      return NextResponse.json({ parties });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }