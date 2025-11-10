import { NextRequest, NextResponse, userAgent } from "next/server";
import jwt from "jsonwebtoken";
import { model, models } from "mongoose";
import { connectToDatabase, driverSchema, userSchema } from "@/utils/schema";
import { generateUserId } from "@/utils/auth";

const User = models.User || model("User", userSchema);

// Helper to verify OTP
async function verifyOTP(session: string, otp: string): Promise<boolean> {
  if (!session || !otp) return false;

  const otpResponse = await fetch(
    `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${session}/${otp}`
  );

  const otpData = await otpResponse.json();
  return otpData.Status === "Success";
}

// Helper to create JWT and set cookies
async function createJWTAndSetCookies(user: any) {
  let jwtObject: any = { user_id: user.user_id, phone: user.phone };

  if (user.role?.name === "driver") {
    const Driver = models.Driver || model("Driver", driverSchema);
    const driver = await Driver.findOne({ user_id: user.role.user, contactNumber: user.phone });
    jwtObject.role = {
      name: "driver",
      user: user.role.user,
      driver_id: driver?.driver_id,
    };
  } else if (user.role?.name === "accountant") {
    jwtObject.role = {
      name: "accountant",
      user: user.role.user,
    };
  }

  // Generate tokens
  const token = jwt.sign(jwtObject, process.env.JWT_SECRET as string, { expiresIn: "30d" });
  const roleToken = jwt.sign({ role: jwtObject.role }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });

  // Create response and set cookies
  const response = NextResponse.json({ message: "User Logged In", status: 200, roleToken, token });
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60,
  });

  if (jwtObject.role) {
    response.cookies.set("role_token", roleToken, {
      path: "/",
      sameSite: "strict",
    });
  }

  return response;
}

// Helper to find or create a user
async function findOrCreateUser(phone: string, deviceType: string) {
  const uid = generateUserId(phone);
  let user = await User.findOne({ user_id: uid });

  if (!user) {
    user = new User({
      user_id: uid,
      phone,
      deviceType,
      lastLogin: Date.now(),
    });
    await user.save();
  } else {
    user.deviceType = user.deviceType || deviceType;
    user.lastLogin = Date.now();
    await user.save();
  }

  return user;
}

export async function POST(req: NextRequest) {
  try {
    // Validate environment variables
    const { TWO_FACTOR_API_KEY, JWT_SECRET, DUMMY_CRED_PHONE, DUMMY_CRED_OTP } = process.env;
    if (!TWO_FACTOR_API_KEY || !JWT_SECRET) {
      throw new Error("Missing required environment variables");
    }

    // Parse request body
    const { phone, session, otp } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json({ message: "Missing phone or OTP" }, { status: 400 });
    }

    await connectToDatabase();

    // Handle dummy credentials for testing
    if (phone === DUMMY_CRED_PHONE && otp === DUMMY_CRED_OTP) {
      const user = await findOrCreateUser(phone, "dummy");
      return await createJWTAndSetCookies(user);
    }

    // Verify OTP
    const otpValid = await verifyOTP(session, otp);
    if (!otpValid) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    // Extract device information
    const { device } = userAgent(req);
    const deviceType = device?.type || "unknown";

    // Format phone and find or create the user
    const formattedPhone = phone.startsWith("+91") ? phone.slice(3) : phone;
    const user = await findOrCreateUser(formattedPhone, deviceType);

    return await createJWTAndSetCookies(user);
  } catch (error: any) {
    console.error("Error in POST handler:", error.message);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
