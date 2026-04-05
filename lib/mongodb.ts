import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://Pallavi:prasad123@cluster0.fqpnxj9.mongodb.net/englishDB";

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(MONGODB_URI);
}