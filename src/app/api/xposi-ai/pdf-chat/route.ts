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

    // -------------------------------------------------------
    // 1️⃣ Generate the query embedding (1536 dimensions)
    // -------------------------------------------------------
    const qEmbed = await openai.embeddings.create({
      model: "text-embedding-3-small", // MUST MATCH SUPABASE VECTOR SIZE
      input: question,
    });

    const queryEmbedding = qEmbed.data[0].embedding;

    // -------------------------------------------------------
    // 2️⃣ Query most similar chunks from Supabase
    // -------------------------------------------------------
    const { data, error } = await supabaseAdmin.rpc("match_pdf_chunks", {
      input_pdf_id: pdf_id,
      query_embedding: queryEmbedding,
      match_count: 6,
    });

    if (error) {
      console.error("❌ match_pdf_chunks error:", error);
      return NextResponse.json(
        { error: "Vector search failed. Check embeddings." },
        { status: 500 }
      );
    }

    const contextText =
      data?.map((row: any) => row.content).join("\n\n") || "";

    // -------------------------------------------------------
    // 3️⃣ Ask OpenAI using ONLY the PDF context
    // -------------------------------------------------------
    const chatRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are XPosi PDF AI. You ONLY answer using the provided PDF context. If the answer is not in the context, reply: 'The information is not available in this PDF.'",
        },
        {
          role: "user",
          content: `PDF context:\n${contextText}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.1,
    });

    const answer = chatRes.choices[0]?.message?.content || "";

    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error("❌ pdf-chat error:", err);
    return NextResponse.json(
      { error: "Server error during chat." },
      { status: 500 }
    );
  }
}
