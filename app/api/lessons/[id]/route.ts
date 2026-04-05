import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Lesson from "@/models/Lesson";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const lesson = await Lesson.findById(id).lean();

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const plain = JSON.parse(JSON.stringify(lesson));
    return NextResponse.json(plain);
  } catch (err) {
    console.error("GET lesson error:", err);
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    await Lesson.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE lesson error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}