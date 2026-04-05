import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import otpGenerator from "otp-generator";
import { sendOTP } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: "All fields required" });
    }

    if (password.length < 6) {
      return Response.json({ error: "Password must be 6+ chars" });
    }

    const existing = await User.findOne({ email });

    if (existing && existing.isVerified) {
      return Response.json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

   const otp = otpGenerator.generate(6, {
  digits: true,
  lowerCaseAlphabets: false,
  upperCaseAlphabets: false,
  specialChars: false,
});

    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await User.findOneAndUpdate(
      { email },
      { name, email, password: hashed, otp, otpExpiry, isVerified: false },
      { upsert: true, new: true }
    );

    // Send email — if this throws, we catch it separately for a clear error
    try {
      await sendOTP(email, otp);
    } catch (mailError) {
      console.error("❌ EMAIL SEND FAILED:", mailError);
      return Response.json({
        error: `Email sending failed: ${(mailError as Error).message}. Check EMAIL_USER and EMAIL_PASS in .env.local`,
      });
    }

    return Response.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("❌ SIGNUP ERROR:", error);
    return Response.json({
      error: `Signup failed: ${(error as Error).message}`,
    });
  }
}