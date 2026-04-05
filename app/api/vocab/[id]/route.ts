import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Vocab from "@/models/Vocab";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    await Vocab.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}