import { generateUserId, verifyToken } from "@/utils/auth";
import { connectToDatabase, driverSchema, userSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const User = models.User || model('User', userSchema);

export async function POST(req: NextRequest) {
    try {
        const { user, error } = await verifyToken(req as Request);
        
        if (!user || error) {
            return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
        }

        await connectToDatabase();

        const data = await req.json();
        const phone = data.phone;
        const role = data.role;

        if (!phone || !role) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // Check if the user exists in Firebase
        const uid = generateUserId(phone);

        // Now query your database with the uid from Firebase
        let existingUser = await User.findOne({ user_id: uid });

        if (!existingUser) {
            // If the user does not exist in your database, create a new one
            const Driver = models.Driver || model('Driver', driverSchema)
            const driver = await Driver.findOne({user_id : user, contactNumber : phone})
            if(!driver && role === 'driver'){
                return NextResponse.json({error : 'Driver Not Found', status : 400})
            }
            const newUser = new User({
                user_id: uid,
                phone: phone,
                role: {
                    name : role,
                    user : user
                },
            });
            await newUser.save();
        } else {
            // If the user exists, update the role or any other necessary fields
            return NextResponse.json({error : "User Already Exists", status : 400})
        }

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error('Error processing request:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}



export async function GET(req: Request) {
    try {
        // Verify the token and get the user information
        const { user, error } = await verifyToken(req);

        if (!user || error) {
            return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
        }

        // Connect to the database
        await connectToDatabase();

        // Fetch users where the role.user matches the authenticated user's ID
        const users = await User.find({ 'role.user': user })

        return NextResponse.json({ users ,status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' ,status: 500 });
    }
}