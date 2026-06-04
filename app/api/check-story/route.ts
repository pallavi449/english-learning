import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(req: Request) {
  try {
    const { story, title } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are a friendly English teacher for beginner and intermediate learners.

Analyze the student's story.

IMPORTANT:
- This app is for English learners.
- Use simple English (CEFR A1-A2 level).
- Do NOT use advanced vocabulary.
- Do NOT rewrite sentences in a literary style.
- Keep suggestions easy to understand.
- Correct only genuine mistakes.
- Explain mistakes in simple language.

Return ONLY valid JSON.

{
  "score": 0,
  "grammarIssues": [
    {
      "original": "",
      "corrected": "",
      "explanation": ""
    }
  ],
  "sentenceIssues": [
    {
      "original": "",
      "suggestion": ""
    }
  ],
  "overallFeedback": "",
  "strengths": [],
  "corrections": 0
}

Scoring Guide:
- 90-100 = Excellent
- 75-89 = Good
- 60-74 = Fair
- Below 60 = Needs Improvement

Rules:
- Score must be between 0 and 100.
- If there are no grammar mistakes, return [].
- If there are no sentence issues, return [].
- Always provide at least 2 strengths.
- Suggestions must be simple and learner-friendly.
- Do not use words like:
  "cease", "inclement weather", "relentless", "sanctuary", "unfurled".
- Prefer simple words:
  "stop", "bad weather", "heavy rain", "home", "opened".
- Return only JSON, no markdown.

Story Title:
${title}

Student Story:
${story}
`;

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return NextResponse.json({
      result: clean,
    });

  } catch (error) {
    console.error("Story Analysis Error:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze story",
      },
      {
        status: 500,
      }
    );
  }
}