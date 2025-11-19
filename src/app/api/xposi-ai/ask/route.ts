import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import OpenAI from "openai";

export async function POST(req: Request) {
  const { question, pdf_id } = await req.json();
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // 1. Create embedding of question
  const qEmbed = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: question,
  });

  const queryVector = qEmbed.data[0].embedding;

  // 2. Fetch top relevant chunks
  const { data } = await supabase.rpc("match_vectors", {
    query_embedding: queryVector,
    match_count: 5,
    pdfid: pdf_id,
  });

  const contextText = data.map((x: any) => x.content).join("\n\n");

  // 3. Ask AI strictly using context
  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a PDF assistant. ONLY answer using the context provided. If the answer is not in the PDF, say 'The information is not in the PDF.'",
      },
      {
        role: "user",
        content: `Context:\n${contextText}\n\nQuestion: ${question}`,
      },
    ],
  });

  const answer = result.choices[0].message.content;

  return NextResponse.json({ answer });
}
