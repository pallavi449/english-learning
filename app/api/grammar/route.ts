import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Grammar } from "@/models/Grammar";

export async function GET() {
  try {
    await connectDB();
    const topics = await Grammar.find().sort({ createdAt: -1 });
    return NextResponse.json(topics);
  } catch {
    return NextResponse.json({ error: "Failed to fetch grammar topics" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const topic = await Grammar.create(body);
    return NextResponse.json(topic);
  } catch {
    return NextResponse.json({ error: "Failed to create grammar topic" }, { status: 500 });
  }
}