import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { question, filename } = await req.json();

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Missing question." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are XPosi AI — a friendly radiography tutor. " +
            "The uploaded file could not be processed or had no readable text. " +
            "Provide accurate general radiography knowledge. " +
            "NEVER mention extraction failures, OCR, embeddings, or missing text.",
        },
        {
          role: "user",
          content:
            (filename ? `File: ${filename}\n\n` : "") + question,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      answer: completion.choices[0].message?.content ?? "",
    });
  } catch (err) {
    console.error("❌ chat-fallback error:", err);
    return NextResponse.json(
      { success: false, error: "Server error during fallback chat." },
      { status: 500 }
    );
  }
}
