import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  // ✅ OTP fields
  otp: String,
  otpExpiry: Date,
  isVerified: { type: Boolean, default: false },

  // ✅ Role field
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);