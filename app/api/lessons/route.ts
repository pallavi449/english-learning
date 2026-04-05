import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Lesson from "@/models/Lesson";

// GET /api/lessons — fetch all lessons
export async function GET() {
  try {
    await connectDB();
    const lessons = await Lesson.find().sort({ createdAt: -1 });
    return NextResponse.json(lessons);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}

// POST /api/lessons — create new lesson
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, sentences, youtubeUrl } = body;

    if (!title || !sentences || sentences.length === 0) {
      return NextResponse.json({ error: "Title and sentences required" }, { status: 400 });
    }

    const lesson = await Lesson.create({ title, sentences, youtubeUrl });
    return NextResponse.json({ success: true, lesson }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}