import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import mammoth from "mammoth";
import OpenAI from "openai";

// pdf-extraction is CJS, so use require + any to avoid TS issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf: any = require("pdf-extraction");

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, filename, path } = body as {
      id?: string;
      filename?: string;
      path?: string;
    };

    if (!id || !filename || !path) {
      return NextResponse.json(
        { success: false, error: "Missing paper metadata (id, filename, path)." },
        { status: 400 }
      );
    }

    // ----------------------------------
    // 0️⃣ CACHING — already prepared?
    // ----------------------------------
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("paper_chunks")
      .select("id")
      .eq("paper_id", id)
      .limit(1);

    if (existingError) {
      console.error("❌ Error checking existing chunks:", existingError.message);
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: true,
        cached: true,
        info: "This paper is already prepared — skipping extraction.",
      });
    }

    // ----------------------------------
    // 1️⃣ DOWNLOAD FILE FROM STORAGE
    // ----------------------------------
    const { data: fileData, error: dlError } = await supabaseAdmin.storage
      .from("xposilearn")
      .download(path);

    if (dlError || !fileData) {
      console.error("❌ Download error:", dlError);
      return NextResponse.json(
        { success: false, error: "Failed to download file from storage." },
        { status: 400 }
      );
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const lowerName = filename.toLowerCase();
    let extractedText = "";

    // ----------------------------------
    // 2️⃣ DOCX → plain text via mammoth
    // ----------------------------------
    if (lowerName.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value.trim();
    }

    // ----------------------------------
    // 3️⃣ PDF → text via pdf-extraction
    // ----------------------------------
    else if (lowerName.endsWith(".pdf")) {
      const parsed = await pdf(buffer, { suppressWarnings: true });
      extractedText = (parsed.text || "").trim();

      // Simple detection for scanned/empty PDFs
      if (!extractedText || extractedText.length < 50) {
        return NextResponse.json(
          {
            success: false,
            error:
              "The PDF appears to be scanned / image-only. OCR is not enabled yet — please upload a text-based PDF or DOCX.",
          },
          { status: 400 }
        );
      }
    }

    // ----------------------------------
    // 4️⃣ UNSUPPORTED
    // ----------------------------------
    else {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Only PDF and DOCX are supported for now.",
        },
        { status: 400 }
      );
    }

    if (!extractedText) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No readable text was found. The file might be empty, encrypted, or fully image-based.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------
    // 5️⃣ CLEANUP OLD CHUNKS (just in case)
    // ----------------------------------
    await supabaseAdmin.from("paper_chunks").delete().eq("paper_id", id);

    // ----------------------------------
    // 6️⃣ CHUNKING
    // ----------------------------------
    const CHUNK_SIZE = 1600;
    const chunks: string[] = [];

    for (let i = 0; i < extractedText.length; i += CHUNK_SIZE) {
      chunks.push(extractedText.slice(i, i + CHUNK_SIZE));
    }

    if (chunks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Extraction succeeded but produced no text chunks.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------
    // 7️⃣ EMBEDDINGS + STORE
    //    (prepared for future real RAG / Q&A)
    // ----------------------------------
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    for (const chunk of chunks) {
      const embedRes = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
      });

      const embedding = embedRes.data[0].embedding;

      const { error: insertError } = await supabaseAdmin
        .from("paper_chunks")
        .insert({
          paper_id: id,
          content: chunk,
          embedding,
        });

      if (insertError) {
        console.error("❌ Insert chunk error:", insertError.message);
      }
    }

    return NextResponse.json({
      success: true,
      cached: false,
      info: `Prepared successfully. Extracted and stored ${chunks.length} chunks.`,
    });
  } catch (err) {
    console.error("❌ PREPARE ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Server error preparing file." },
      { status: 500 }
    );
  }
}
