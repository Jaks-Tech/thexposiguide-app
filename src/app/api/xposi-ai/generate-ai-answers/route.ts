import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { paperId } = (await req.json()) as { paperId?: string };

    if (!paperId) {
      return NextResponse.json(
        { success: false, error: "Missing paperId" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch all chunks for this paper
    const { data: chunks, error } = await supabaseAdmin
      .from("paper_chunks")
      .select("content")
      .eq("paper_id", paperId)
      .order("id", { ascending: true });

    if (error) {
      console.error("❌ Error fetching chunks:", error.message);
      return NextResponse.json(
        { success: false, error: "Failed to fetch prepared chunks." },
        { status: 500 }
      );
    }

    if (!chunks || chunks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No prepared chunks found. Please run 'Prepare Paper' first.",
        },
        { status: 400 }
      );
    }

    // 2️⃣ Concatenate text with a safety cap
    const MAX_CHARS = 35000; // ~ a few dozen pages
    let combined = "";
    for (const c of chunks) {
      if (!c.content) continue;
      if (combined.length + c.content.length > MAX_CHARS) break;
      combined += c.content + "\n\n";
    }

    if (!combined) {
      return NextResponse.json(
        {
          success: false,
          error: "Chunks are empty. Try re-preparing this paper.",
        },
        { status: 400 }
      );
    }

    // 3️⃣ Call OpenAI to generate exam-style answers
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are XPosi AI, a radiography exam tutor. You receive the ENTIRE content of a past paper (questions plus any text). Your job is to:\n\n1. Identify each distinct question or task in the paper.\n2. For each one, write a clear, well-structured answer.\n3. Use bullet points, sub-headings, and short paragraphs.\n4. Explain reasoning where helpful and highlight key values, anatomy, safety principles, and protocols.\n5. If some questions are incomplete or unclear, say so explicitly and answer as best as you can from context.",
        },
        {
          role: "user",
          content:
            "Below is the full text extracted from a radiography past paper. Generate a numbered list of exam-style answers that matches the order of the questions in the paper. Do NOT copy the entire paper again; just give answers.\n\n---\n\n" +
            combined,
        },
      ],
    });

    const answer = completion.choices[0].message.content || "";

    return NextResponse.json({ success: true, answer });
  } catch (err) {
    console.error("❌ GENERATE ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate answers" },
      { status: 500 }
    );
  }
}
