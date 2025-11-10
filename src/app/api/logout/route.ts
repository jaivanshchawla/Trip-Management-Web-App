import { verifyToken } from "@/utils/auth";
import { connectToDatabase, TokenBlacklistSchema } from "@/utils/schema";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { model, models } from "mongoose";

// Define the TokenBlackList model
const TokenBlackList = models.TokenBlackList || model('TokenBlackList', TokenBlacklistSchema);

export async function GET(req: NextRequest) {
    try {
        // Connect to the database
        await connectToDatabase();

        // Get the token from cookies
        const token = req.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        // Decode the token
        const decoded = jwt.decode(token);

        // Check if the decoded token is a JwtPayload and has the 'exp' property
        if (decoded && typeof decoded !== 'string' && 'exp' in decoded) {
            // Calculate the expiration date
            const expiresAt = new Date((decoded.exp as any) * 1000);

            // Check if the token is already blacklisted
            const blacklistedToken = await TokenBlackList.findOne({ token });
            if (!blacklistedToken) {
                const newToken = new TokenBlackList({ token, expiresAt });
                await newToken.save();
            }

            // Prepare the response object
            const response = NextResponse.json({ message: 'Token invalidated successfully', status: 200 });

            // Clear the token cookies
            response.cookies.delete('auth_token');
            response.cookies.delete('role_token');

            // Set the Location header for redirect
            response.headers.set('Location', new URL('/api/logout', req.url).toString());

            // Return the response (with redirect and cookies)
            return response;
        } else {
            return NextResponse.json({ error: 'Invalid token', status: 400 });
        }
    } catch (error) {
        console.error('Error processing token invalidation:', error);
        return NextResponse.json({ error: 'Internal server error', status: 500 });
    }
}
