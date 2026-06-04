// app/api/story-cards/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose, { Schema, models, model } from "mongoose";

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

export async function GET() {
  try {
    await connectDB();
    const cards = await StoryCard.find().sort({ createdAt: -1 });
    return NextResponse.json(cards);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch story cards" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, imageUrl, prompt, minWords } = body;

    if (!title || !imageUrl || !prompt) {
      return NextResponse.json(
        { error: "title, imageUrl, and prompt are required" },
        { status: 400 }
      );
    }

    const card = await StoryCard.create({ title, imageUrl, prompt, minWords: minWords ?? 40 });
    return NextResponse.json({ success: true, card }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create story card" }, { status: 500 });
  }
}