import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Grammar } from "@/models/Grammar";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    await Grammar.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const topic = await Grammar.findById(id);
    if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(topic);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}