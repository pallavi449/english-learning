import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    // ✅ VALIDATION
    if (!email || !password) {
      return Response.json({ error: "All fields required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ CHECK VERIFIED (if using OTP system)
    if (!user.isVerified) {
      return Response.json(
        { error: "Please verify your account first" },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }

    // ✅ GET SECRET KEY FROM ENV
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET not found in .env");
    }

   // ✅ CREATE TOKEN — add role here
const token = jwt.sign(
  { userId: user._id, email: user.email, role: user.role }, // 👈 add role
  secret,
  { expiresIn: "7d" }
);

    return Response.json({
      message: "Login successful ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}