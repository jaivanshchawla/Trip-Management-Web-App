import { verifyToken } from "@/utils/auth";
import { connectToDatabase } from "@/utils/schema";
import { NextResponse } from "next/server";
import { fcmTokenSchema } from '../../../../utils/schema';
import { model, models } from "mongoose";

// Add timestamps to your schema to track when tokens are added or updated
fcmTokenSchema.set('timestamps', true);
const FcmToken = models.fcmToken || model('fcmToken', fcmTokenSchema);

export async function POST(req) {
  const { user, error } = await verifyToken(req);
  if (error) {
    console.log(error);
    return NextResponse.json({ error, status: 500 });
  }

  await connectToDatabase();
  try {
    const { fcm_token } = await req.json();

    if (!fcm_token) {
        return NextResponse.json({ error: 'FCM token is required', status: 400 });
    }

    // Use findOneAndUpdate with upsert:true
    const updatedToken = await FcmToken.findOneAndUpdate({ user_id: user, fcm_token: fcm_token }, // Query: Find a doc with this user AND this token { $set: { user_id: user, fcm_token: fcm_token } }, // Data to set (ensures user_id is correct) { upsert: true, new: true } // Options: create if not found, and return the new/updated doc
    );

    return NextResponse.json({
      message: 'FCM token registered successfully',
      status: 200,
      fcm_token: updatedToken
    });

  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 });
  }
}
