import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import OpenAI from "openai";
import mammoth from "mammoth";

const pdf = require("pdf-extraction");

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfId = `${Date.now()}-${file.name}`;
    const lowerName = file.name.toLowerCase();

    let extractedText = "";

    // -------------------------------------------------------
    // 1️⃣ DOCX TEXT EXTRACTION
    // -------------------------------------------------------
    if (lowerName.endsWith(".docx")) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value.trim();
      } catch (err) {
        console.error("❌ DOCX extraction failed:", err);
        return NextResponse.json(
          { success: false, error: "Could not extract text from Word document." },
          { status: 400 }
        );
      }
    }

    // -------------------------------------------------------
    // 2️⃣ PDF TEXT EXTRACTION
    // -------------------------------------------------------
    else if (lowerName.endsWith(".pdf")) {
      try {
        const parsed = await pdf(buffer, { suppressWarnings: true });
        extractedText = parsed.text?.trim() || "";
      } catch (err) {
        console.error("❌ PDF extraction failed:", err);
        return NextResponse.json(
          { success: false, error: "Could not extract text from this PDF." },
          { status: 400 }
        );
      }
    }

    // -------------------------------------------------------
    // 3️⃣ UNSUPPORTED FILE TYPE
    // -------------------------------------------------------
    else {
      return NextResponse.json(
        { success: false, error: "Unsupported file type. Upload PDF or DOCX." },
        { status: 400 }
      );
    }

    if (!extractedText) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The document contains no readable text (may be scanned or image-only).",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------------
    // 4️⃣ Upload original file to Supabase storage
    // -------------------------------------------------------
    await supabaseAdmin.storage.from("xposi-pdfs").upload(pdfId, buffer, {
      contentType: "application/octet-stream",
      upsert: true,
    });

    // -------------------------------------------------------
    // 5️⃣ Chunk + embed + store
    // -------------------------------------------------------
    const CHUNK_SIZE = 1500;
    const chunks = [];

    for (let i = 0; i < extractedText.length; i += CHUNK_SIZE) {
      chunks.push(extractedText.slice(i, i + CHUNK_SIZE));
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    for (const chunk of chunks) {
      const res = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
      });

      await supabaseAdmin.from("pdf_chunks").insert({
        pdf_id: pdfId,
        content: chunk,
        embedding: res.data[0].embedding,
      });
    }

    return NextResponse.json({ success: true, pdf_id: pdfId });
  } catch (err) {
    console.error("❌ upload error:", err);
    return NextResponse.json(
      { success: false, error: "Server error processing file." },
      { status: 500 }
    );
  }
}
