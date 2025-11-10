import { verifyToken } from "@/utils/auth";
import { encryptData, decryptData } from "@/utils/encryption";
import { connectToDatabase, userSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";


const User = models.User || model('User', userSchema);


export async function POST(req: Request) {
    try {
        const data = await req.json();
        await connectToDatabase();

        const { user_id } = data;
        if (!user_id) {
            return NextResponse.json({ message: "User ID is required", status: 400 });
        }

        const user = await User.findOne({ user_id });
        if (!user) {
            const newUser = new User(data);
            await newUser.save();
            return NextResponse.json({ message: "User Created", status: 201 });
        } else {
            return NextResponse.json({ message: "User Logged in", status: 200 });
        }
    } catch (error) {
        console.error('POST /api/user error:', error);
        return NextResponse.json({ error: 'Internal Server Error', status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { user, error } = await verifyToken(req);
        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized', status: 401 });
        }

        await connectToDatabase();
        const curUser = await User.findOne({ user_id: user });
        if (!curUser) {
            return NextResponse.json({ message: "User not found", status: 404 });
        }

        // Decrypt the phone before sending it to the frontend

        return NextResponse.json({ user: curUser.toObject(), status: 200 });
    } catch (error) {
        console.error('GET /api/user error:', error);
        return NextResponse.json({ error: 'Internal Server Error', status: 500 });
    }
}
