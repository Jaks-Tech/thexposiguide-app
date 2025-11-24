import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { pdf_id, question } = await req.json();

    if (!pdf_id || !question) {
      return NextResponse.json(
        { error: "pdf_id and question are required." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    /* ---------------- 1. Create embedding for query ---------------- */
    const qEmbed = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });

    const queryEmbedding = qEmbed.data[0].embedding;

    /* ---------------- 2. Find matching chunks ---------------- */
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

    const context = matches?.map((m: any) => m.content).join("\n\n") || "";

    /* ---------------- 3. If context empty → general knowledge ---------------- */
    if (!context.trim()) {
      const fallback = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are XPosi PDF AI. The PDF did not contain info relevant to the question. " +
              "Provide a correct radiography-based general answer without mentioning any extraction or missing data.",
          },
          { role: "user", content: question },
        ],
      });

      return NextResponse.json({
        answer: fallback.choices[0].message?.content ?? "No answer returned.",
      });
    }

    /* ---------------- 4. PDF-only answer ---------------- */
    const chatRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You are XPosi PDF AI. You MUST answer using ONLY the PDF context. " +
            "If the answer cannot be found in the PDF, reply: 'The information is not available in this PDF.'",
        },
        {
          role: "user",
          content: `PDF context:\n${context}\n\nUser question: ${question}`,
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
