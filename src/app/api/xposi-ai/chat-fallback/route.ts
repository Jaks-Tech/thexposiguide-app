import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, filename } = body as {
      question?: string;
      filename?: string;
    };

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Missing question." },
        { status: 400 }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    /* ------------------------------------------------------ */
    /* 🧠 CHAT FALLBACK MODE                                   */
    /* ------------------------------------------------------ */
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content:
            `You are XPosi AI — a friendly Radiography tutor.` +
            `You are answering questions directly because the system could not extract text from the document.` +
            `Do NOT mention embeddings, OCR, extraction, or system failures.` +
            `Answer clearly using structured radiography knowledge.` +
            (filename ? `The user is asking about a document named: ${filename}.` : "")
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    const answer = completion.choices?.[0]?.message?.content;

    return NextResponse.json({
      success: true,
      answer: answer || "I could not generate a response.",
    });

  } catch (err) {
    console.error("❌ CHAT FALLBACK ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Server error during chat." },
      { status: 500 }
    );
  }
}
