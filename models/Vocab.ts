import mongoose, { Schema, models, model } from "mongoose";

const VocabSchema = new Schema(
  {
    word: { type: String, required: true },
    meaning: { type: String, required: true },        // English meaning
    hindiMeaning: { type: String, required: true },   // Hindi meaning
    example: { type: String, required: true },        // Example sentence
    hindiExample: { type: String, required: true },   // Hindi example
    pronunciation: { type: String, default: "" },     // e.g. "hap-ee"
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    category: { type: String, default: "general" },   // e.g. emotions, food, travel
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

const Vocab = models.Vocab || model("Vocab", VocabSchema);
export default Vocab;