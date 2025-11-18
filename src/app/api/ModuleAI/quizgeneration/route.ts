import { NextResponse } from "next/server";
import OpenAI from "openai";

// -----------------------------
// Types
// -----------------------------
type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

type QuizResponse = {
  questions: QuizQuestion[];
};

// -----------------------------
// OpenAI Client
// -----------------------------
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// -----------------------------
// POST Handler
// -----------------------------
export async function POST(req: Request) {
  try {
    const { content, numQuestions = 7 } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid module content." },
        { status: 400 }
      );
    }

    // Limit super long content to avoid high token usage
    const trimmedContent =
      content.length > 12000 ? content.slice(0, 12000) : content;

    // -----------------------------
    // AI Prompt
    // -----------------------------
    const prompt = `
You are an expert radiography tutor. Generate ${numQuestions} multiple-choice questions
based ONLY on the learning material provided below.

REQUIREMENTS:
- All questions MUST be strictly based on the content.
- Each question MUST have EXACTLY 4 answer options.
- Only ONE correct answer per question.
- Each question MUST include a short explanation.
- The questions MUST be medically accurate.
- Output MUST be valid JSON only — strictly match the schema below.
- Do NOT include words like "Here is the JSON".
- No markdown, no comments, no extra text.

EXPECTED JSON FORMAT:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}

CONTENT TO USE:
${trimmedContent}
`;

    // -----------------------------
    // Send to GPT
    // -----------------------------
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You generate radiography quiz questions." },
        { role: "user", content: prompt },
      ],
    });

    const jsonString = completion.choices[0].message.content;

    // -----------------------------
    // Safe Parsing
    // -----------------------------
    let result: QuizResponse = { questions: [] };

    try {
      result = JSON.parse(jsonString || "{}") as QuizResponse;
    } catch (_err) {
      return NextResponse.json(
        {
          error: "AI returned invalid JSON.",
          raw: jsonString,
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // Validate structure
    // -----------------------------
    if (!Array.isArray(result.questions)) {
      return NextResponse.json(
        {
          error: "AI response missing 'questions' array.",
          raw: result,
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // Final Response
    // -----------------------------
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("AI Quiz Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz." },
      { status: 500 }
    );
  }
}
