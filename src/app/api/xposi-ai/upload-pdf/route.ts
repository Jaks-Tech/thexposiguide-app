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

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfId = `${Date.now()}-${file.name}`;
    const lower = file.name.toLowerCase();

    let extractedText = "";

    /* ---------------- DOCX ---------------- */
    if (lower.endsWith(".docx")) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value.trim();
      } catch {
        return NextResponse.json(
          { success: false, error: "Unable to read Word file." },
          { status: 400 }
        );
      }
    }

    /* ---------------- PDF ---------------- */
    else if (lower.endsWith(".pdf")) {
      try {
        const parsed = await pdf(buffer, { suppressWarnings: true });
        extractedText = (parsed.text || "").trim();
      } catch {
        return NextResponse.json(
          { success: false, error: "Unable to extract text from PDF." },
          { status: 400 }
        );
      }
    }

    else {
      return NextResponse.json(
        { success: false, error: "Unsupported file type." },
        { status: 400 }
      );
    }

    if (!extractedText) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This file contains no extractable text. It may be scanned-only.",
        },
        { status: 400 }
      );
    }

    /* ---------------- Upload original file ---------------- */
    await supabaseAdmin.storage.from("xposi-pdfs").upload(pdfId, buffer, {
      contentType: "application/octet-stream",
      upsert: true,
    });

    /* ---------------- Chunk the text ---------------- */
    const CHUNK_SIZE = 1800;
    const chunks = [];

    for (let i = 0; i < extractedText.length; i += CHUNK_SIZE) {
      const slice = extractedText.slice(i, i + CHUNK_SIZE).trim();
      if (slice.length > 0) chunks.push(slice);
    }

    /* ---------------- Generate embeddings ---------------- */
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    for (const content of chunks) {
      const embed = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
      });

      await supabaseAdmin.from("pdf_chunks").insert({
        pdf_id: pdfId,
        content,
        embedding: embed.data[0].embedding,
      });
    }

    return NextResponse.json({ success: true, pdf_id: pdfId });
  } catch (err) {
    console.error("❌ Upload Error:", err);
    return NextResponse.json(
      { success: false, error: "Server error while processing file." },
      { status: 500 }
    );
  }
}
