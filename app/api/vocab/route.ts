import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Vocab from "@/models/Vocab";

// GET /api/vocab — get all vocab (with optional filter)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level");
    const category = searchParams.get("category");

    const filter: Record<string, string> = {};
    if (level) filter.level = level;
    if (category) filter.category = category;

    const vocab = await Vocab.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(vocab);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch vocab" }, { status: 500 });
  }
}

// POST /api/vocab — save one or many vocab words
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Accept single object or array
    const words = Array.isArray(body) ? body : [body];

    const saved = await Vocab.insertMany(words);
    return NextResponse.json({ success: true, count: saved.length, vocab: saved }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save vocab" }, { status: 500 });
  }
}