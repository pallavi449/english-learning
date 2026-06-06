import { Schema, models, model } from "mongoose";

const ExampleSchema = new Schema({
  english: { type: String, required: true },
  hindi:   { type: String, required: true },
});

const RuleSchema = new Schema({
  rule:     { type: String, required: true },
  hindi:    { type: String, required: true },
  examples: [ExampleSchema],
});

const GrammarSchema = new Schema(
  {
    title:      { type: String, required: true },
    hindiTitle: { type: String, required: true },
    icon:       { type: String, required: true },
    color:      { type: String, required: true },
    rules:      [RuleSchema],
  },
  { timestamps: true }
);

export const Grammar = models.Grammar || model("Grammar", GrammarSchema);