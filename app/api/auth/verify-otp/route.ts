import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, otp } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json({ error: "User not found" });
    }

    if (user.otp !== otp) {
      return Response.json({ error: "Invalid OTP" });
    }

    if (user.otpExpiry < new Date()) {
      return Response.json({ error: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = null;

    await user.save();

    return Response.json({ message: "Account verified ✅" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Verification failed" });
  }
}