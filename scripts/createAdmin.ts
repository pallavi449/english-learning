// scripts/createAdmin.ts
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

async function createAdmin() {
  await connectDB();

  const hashedPassword = await bcrypt.hash("Admin@1234", 10);

  await User.findOneAndUpdate(
    { email: "admin@gmail.com" },
    {
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    }
  );

  console.log("✅ Admin updated successfully!");
  process.exit(0);
}

createAdmin();