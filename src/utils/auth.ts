// utils/auth.ts
import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { connectToDatabase, TokenBlacklistSchema, userSchema } from '@/utils/schema'; // Import your schema
import { model, models } from 'mongoose';
import crypto from 'crypto';

// Define the TokenBlackList model
const TokenBlackList = models.TokenBlackList || model('TokenBlackList', TokenBlacklistSchema);
const User = models.User || model('User', userSchema)

export async function verifyToken(req: Request) {
  const token = fetchCookie(req as NextRequest);
  
  
  if (!token) {
    return { error: 'Unauthorized: No token provided' };
  }

  try {
    // Connect to the database to check the blacklist
    await connectToDatabase();
    
    // Check if the token is blacklisted
    const blacklistedToken = await TokenBlackList.findOne({ token });
    if (blacklistedToken) {
      return { error: 'Unauthorized: Token is blacklisted' };
    }

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const existingUser = await User.findOne({user_id : decodedToken.user_id})
    if(!existingUser){
      return {error : 'Unauthorized User'}
    }

    // Optionally, you can add more checks for the token payload
    if (decodedToken.role) return {user : decodedToken.role.user}

      
    else return { user: decodedToken.user_id };
    
  } catch (err) {
    return { error: 'Unauthorized: Invalid token' };
  }
}

export function fetchCookie(req: NextRequest) {
  const token = req.cookies.get('auth_token');
  return token?.value
}

export function generateUserId(phoneNumber: string): string {
  // Remove any non-digit characters from the phone number
  const sanitizedPhone = phoneNumber.replace(/\D/g, '');

  // Generate a SHA-256 hash of the sanitized phone number
  const hash = crypto.createHash('sha256').update(sanitizedPhone).digest('hex');

  // Truncate the hash to create a user_id
  return hash.substring(0, 16);
}
