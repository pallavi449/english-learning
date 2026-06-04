// app/api/story-cards/[id]/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Schema, models, model } from "mongoose";

const StoryCardSchema = new Schema(
  {
    title:    { type: String, required: true },
    imageUrl: { type: String, required: true },
    prompt:   { type: String, required: true },
    minWords: { type: Number, default: 40 },
  },
  { timestamps: true }
);

const StoryCard = models.StoryCard || model("StoryCard", StoryCardSchema);

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await StoryCard.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete story card" }, { status: 500 });
  }
}