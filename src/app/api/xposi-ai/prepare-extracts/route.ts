import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import mammoth from "mammoth";
import OpenAI from "openai";
import * as Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import { createCanvas } from "canvas";

// pdfjs worker fix
pdfjsLib.GlobalWorkerOptions.workerSrc = "";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf: any = require("pdf-extraction");

export const runtime = "nodejs";

/* ------------------------------------------------------ */
/* Helper: Convert scanned PDF pages -> JPEG for OCR      */
/* ------------------------------------------------------ */
async function renderPdfPagesToImages(pdfBuffer: Buffer): Promise<Buffer[]> {
  const uint8 = new Uint8Array(pdfBuffer);

  const loadingTask = pdfjsLib.getDocument({
    data: uint8,
    disableWorker: true,
  } as any);

  const pdfDoc = await loadingTask.promise;

  const images: Buffer[] = [];
  for (let pg = 1; pg <= pdfDoc.numPages; pg++) {
    const page = await pdfDoc.getPage(pg);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");

    await page.render({ canvasContext: ctx as any, viewport }).promise;

    images.push(canvas.toBuffer("image/jpeg"));
  }
  return images;
}

/* ------------------------------------------------------ */
/* MAIN HANDLER                                           */
/* ------------------------------------------------------ */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, filename, path } = body;

    if (!id || !filename || !path) {
      return NextResponse.json({
        success: false,
        error: "Missing paper metadata.",
      });
    }

    /* 0️⃣ Skip if already prepared */
    const { data: existing } = await supabaseAdmin
      .from("paper_chunks")
      .select("id")
      .eq("paper_id", id)
      .limit(1);

    if (existing?.length) {
      return NextResponse.json({
        success: true,
        cached: true,
        fallback: false,
        info: "Already prepared earlier.",
      });
    }

    /* 1️⃣ Get public URL (bypass RLS) */
    const { data: publicData } = supabaseAdmin.storage
      .from("xposilearn")
      .getPublicUrl(path);

    const fileUrl = publicData?.publicUrl;
    if (!fileUrl) {
      return NextResponse.json({
        success: true,
        fallback: true,
        info: "Extraction failed (URL missing). Chat mode enabled.",
      });
    }

    let extractedText = "";
    const res = await fetch(fileUrl);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const lower = filename.toLowerCase();

    /* ------------------------------------------------------ */
    /* 2️⃣ FILE EXTRACTION LOGIC                               */
    /* ------------------------------------------------------ */

    try {
      // DOC / DOCX
      if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
        const r = await mammoth.extractRawText({ buffer });
        extractedText = r.value.trim();
      }

      // TXT
      else if (lower.endsWith(".txt")) {
        extractedText = buffer.toString("utf8").trim();
      }

      // MARKDOWN
      else if (lower.endsWith(".md")) {
        extractedText = buffer.toString("utf8").trim();
      }

      // PPT/PPTX
      else if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) {
        extractedText =
          "PPTX extraction unsupported. Convert slides to PDF or DOCX.";
      }

      // IMAGES → OCR
      else if (
        lower.endsWith(".png") ||
        lower.endsWith(".jpg") ||
        lower.endsWith(".jpeg") ||
        lower.endsWith(".webp") ||
        lower.endsWith(".gif")
      ) {
        const ocr = await Tesseract.recognize(buffer, "eng");
        extractedText = ocr.data.text.trim();
      }

      // PDF → text → fallback OCR
      else if (lower.endsWith(".pdf")) {
        let pdfData = await pdf(buffer);
        extractedText = pdfData.text?.trim() || "";

        if (!extractedText || extractedText.length < 50) {
          // OCR
          extractedText = "";
          const pages = await renderPdfPagesToImages(buffer);

          for (const img of pages) {
            const ocr = await Tesseract.recognize(img, "eng");
            extractedText += "\n" + ocr.data.text;
          }

          extractedText = extractedText.trim();
        }
      }
    } catch (e) {
      console.log("⚠ Extraction attempt failed:", e);
      extractedText = "";
    }

    /* ------------------------------------------------------ */
    /* 3️⃣ IF EXTRACTION FAILS → FALLBACK CHAT MODE            */
    /* ------------------------------------------------------ */
    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json({
        success: true,
        fallback: true,
        info:
          "❌ XPosiAI could not extract text from this file. You can still chat with this paper using AI.",
      });
    }

    /* ------------------------------------------------------ */
    /* 4️⃣ Chunk + Embed (normal success flow)                 */
    /* ------------------------------------------------------ */

    await supabaseAdmin.from("paper_chunks").delete().eq("paper_id", id);

    const chunks: string[] = [];
    const CHUNK_SIZE = 1600;
    for (let i = 0; i < extractedText.length; i += CHUNK_SIZE) {
      chunks.push(extractedText.slice(i, i + CHUNK_SIZE));
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    for (const chunk of chunks) {
      const emb = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
      });

      await supabaseAdmin.from("paper_chunks").insert({
        paper_id: id,
        content: chunk,
        embedding: emb.data[0].embedding,
      });
    }

    return NextResponse.json({
      success: true,
      fallback: false,
      info: `Prepared successfully. Extracted ${chunks.length} chunks.`,
    });
  } catch (err) {
    console.error("❌ PREPARE ERROR:", err);

    // FINAL CATCH: allow chat mode even on full crash
    return NextResponse.json({
      success: true,
      fallback: true,
      info: "Extraction crashed, but you can still chat with the AI.",
    });
  }
}
