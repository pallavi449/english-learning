import mongoose, { Schema, models, model } from "mongoose";

const SentenceSchema = new Schema({
  hindi: { type: String, required: true },
  english: { type: String, required: true },
});

const LessonSchema = new Schema(
  {
    title: { type: String, required: true },
    youtubeUrl: { type: String, default: "" },
    sentences: [SentenceSchema],
  },
  { timestamps: true }
);

const Lesson = models.Lesson || model("Lesson", LessonSchema);

export default Lesson;