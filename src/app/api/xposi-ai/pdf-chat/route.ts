import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { pdf_id, question, history = [] } = await req.json();

    if (!pdf_id || !question) {
      return NextResponse.json(
        { error: "pdf_id and question are required." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    /* ------------------ Convert history into clean text ------------------ */
    const historyText = history
      .map((m: any) => `${m.sender === "user" ? "User" : "AI"}: ${m.text}`)
      .join("\n");

    /* ---------------- 1. Embedding for user query ---------------- */
    const qEmbed = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });

    const queryEmbedding = qEmbed.data[0].embedding;

    /* ---------------- 2. Find matching PDF chunks ---------------- */
    const { data: matches, error } = await supabaseAdmin.rpc(
      "match_pdf_chunks",
      {
        input_pdf_id: pdf_id,
        query_embedding: queryEmbedding,
        match_count: 6,
      }
    );

    if (error) {
      console.error("❌ match_pdf_chunks:", error);
      return NextResponse.json(
        { error: "Vector search failed." },
        { status: 500 }
      );
    }

    const context =
      matches?.map((m: any) => m.content).join("\n\n") || "";

    /* ---------------- 3. If no PDF context → fallback general answer ---------------- */
    if (!context.trim()) {
      const fallback = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are XPosi PDF AI. PDF had no relevant info. Use general radiography knowledge. " +
              "Do not mention missing PDF content.",
          },
          { role: "assistant", content: historyText || "" },
          { role: "user", content: question },
        ],
      });

      return NextResponse.json({
        answer: fallback.choices[0].message?.content ?? "No answer returned.",
      });
    }

    /* ---------------- 4. Combined: PDF context + Chat History ---------------- */

    const finalPrompt = `
PDF Extracted Context:
${context}

Conversation so far:
${historyText}

New User Question:
${question}

Using ONLY the PDF context above, answer the new question. 
If the answer is not inside the PDF context, reply:
"The information is not available in this PDF."
`;

    const chatRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You are XPosi PDF AI. You must answer solely using the PDF context.",
        },
        {
          role: "user",
          content: finalPrompt,
        },
      ],
    });

    return NextResponse.json({
      answer: chatRes.choices[0]?.message?.content || "",
    });
  } catch (err) {
    console.error("❌ pdf-chat error:", err);
    return NextResponse.json(
      { error: "Server error during chat." },
      { status: 500 }
    );
  }
}
