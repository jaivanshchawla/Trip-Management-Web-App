import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { connectToDatabase, userSchema } from "@/utils/schema";
import { models, model } from "mongoose";
import {parse} from 'cookie'

const User = models.User || model("User", userSchema);

export async function GET(req: Request) {
  try {
    // Extract the 'Authorization' header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "Unauthorized access: Missing authorization header" },
        { status: 401 }
      );
    }

    // Parse the token from the 'Authorization' header
    const tokenMatch = authHeader.match(/Bearer\s+(.*)/);
    const token = tokenMatch ? parse(tokenMatch[1])['"token'] : null;
    console.log(parse(token as string))

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized access: Token not found" },
        { status: 401 }
      );
    }

    // Verify the token
    let verifiedToken: JwtPayload | string;
    try {
      verifiedToken = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    } catch (err) {
      // Catch JWT-specific errors and return 401
      if (
        err instanceof jwt.JsonWebTokenError || // Invalid token
        err instanceof jwt.TokenExpiredError || // Expired token
        err instanceof jwt.NotBeforeError // Token not active yet
      ) {
        return NextResponse.json(
          { message: `Unauthorized access: ${err.message}` },
          { status: 401 }
        );
      }
      throw err; // Re-throw other errors for generic handling
    }

    // Connect to the database
    await connectToDatabase();

    // Fetch users from the database
    const users = await User.find();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching users:", error.message);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
