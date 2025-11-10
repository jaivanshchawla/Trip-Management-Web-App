import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const SECRET_KEY = process.env.JWT_SECRET || "your-default-secret";

export async function POST(req: Request) {
  try {
    // Parse the request body
    const data = await req.json();
    const { phone, password } = data;

    // Retrieve admin phone numbers from environment variables
    const phonearr = JSON.parse(
      process.env.NEXT_PUBLIC_ADMIN_LOGIN_PHONE as string
    ) as string[];

    if (!phonearr.includes(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    // Retrieve the hashed password from environment variables
    const hashedPassword = "$2b$10$GyrD9WkJ3agyLNo.yJUP1em9gHCGoYJR5DTr2mmMGTRmgTrxaLQ2a"

    if (!hashedPassword) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Compare the provided password with the stored hash
    const hash = await bcrypt.hash(password,10)
    // console.log('user-pass',hash)
    // console.log('env-pass',hashedPassword)
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Create a JWT token
    const token = jwt.sign(
      { phone, role: "admin" }, // Payload
      SECRET_KEY, // Secret key
      { expiresIn: "1d" } // Token expiry
    );

    // Set the JWT as a cookie
    const cookie = serialize("token", token, {
      httpOnly: true, // Prevents client-side access
      secure: process.env.NODE_ENV === "production", // Ensures secure cookies in production
      sameSite: "strict", // Prevents CSRF
      maxAge: 60 * 60 * 24, // 1 hour
      path: "/", // Available across the entire app
    });

    return NextResponse.json({ message: "Login successful", token : cookie },{status : 200});
  } catch (error) {
    console.error("Error in admin login:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
