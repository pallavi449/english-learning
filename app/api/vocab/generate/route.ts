import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, level, count = 10 } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const prompt = `Generate ${count} English vocabulary words for Hindi-speaking beginners learning English.
Topic: "${topic}"
Level: ${level || "beginner"}

For each word, provide:
- word: the English word
- meaning: simple English meaning (1 sentence, easy words)
- hindiMeaning: meaning in Hindi
- example: a simple English sentence using the word (daily life context)
- hindiExample: the same example sentence in Hindi
- pronunciation: how to pronounce it (e.g. "hap-ee" for happy)
- level: "${level || "beginner"}"
- category: "${topic}"

IMPORTANT: Respond ONLY with a valid JSON array. No explanation, no markdown, no backticks.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // cheap & fast, ~$0.0002 per request
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }, // forces valid JSON
      max_tokens: 4096,
    });

    const text = response.choices[0].message.content ?? "";

    // gpt-4o-mini with json_object mode wraps in an object, extract the array
    const parsed = JSON.parse(text);
    const vocab = Array.isArray(parsed) ? parsed : parsed.vocab ?? parsed.words ?? Object.values(parsed)[0];

    if (!Array.isArray(vocab) || vocab.length === 0) {
      return NextResponse.json({ error: "AI returned empty vocabulary" }, { status: 500 });
    }

    return NextResponse.json({ success: true, vocab });
  } catch (err) {
    console.error("Generate error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate vocab";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}