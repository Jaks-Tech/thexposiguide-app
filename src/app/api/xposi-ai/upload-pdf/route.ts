import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import OpenAI from "openai";
import mammoth from "mammoth";

import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import path from "path";
import { NodeCanvasFactory } from "@/lib/NodeCanvasFactory";

const pdf = require("pdf-extraction");

export const runtime = "nodejs";

/* ---------------- pdfjs worker (REQUIRED for Node) ---------------- */
pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(
  process.cwd(),
  "node_modules/pdfjs-dist/legacy/build/pdf.worker.js"
);

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
      /* Try digital extraction first */
      try {
        const parsed = await pdf(buffer, { suppressWarnings: true });
        extractedText = (parsed.text || "").trim();
      } catch {
        extractedText = "";
      }

      const clean = extractedText.replace(/\s+/g, "");

      /* -----------------------------------------------------------
         If no readable text → fallback to OCR with enhancements
      ----------------------------------------------------------- */
      if (!clean || clean.length < 10) {
        console.log("⚠️ No extractable digital text — running OCR...");
        extractedText = await runHighQualityOCR(buffer);
      }
    }

    /* ---------------- UNSUPPORTED TYPE ---------------- */
    else {
      return NextResponse.json(
        { success: false, error: "Unsupported file type." },
        { status: 400 }
      );
    }

    /* ---------------- Upload Original File ---------------- */
    await supabaseAdmin.storage.from("xposi-pdfs").upload(pdfId, buffer, {
      contentType: "application/octet-stream",
      upsert: true,
    });

    /* ---------------- Chunk Extracted Text ---------------- */
    const CHUNK_SIZE = 1800;
    const chunks: string[] = [];

    for (let i = 0; i < extractedText.length; i += CHUNK_SIZE) {
      const slice = extractedText.slice(i, i + CHUNK_SIZE).trim();
      if (slice.length > 0) chunks.push(slice);
    }

    /* ---------------- Generate Embeddings ---------------- */
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

/* ------------------------------------------------------------------
   OCR ENGINE — enhanced contrast, cropping, high DPI, pdfjs rendering
--------------------------------------------------------------------- */
async function runHighQualityOCR(buffer: Buffer) {
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;

  let fullText = "";

  for (let i = 1; i <= doc.numPages; i++) {
    console.log(`🔍 OCR processing page ${i}/${doc.numPages}`);

    const page = await doc.getPage(i);

    /* Higher DPI drastically improves OCR accuracy */
    const viewport = page.getViewport({ scale: 4 });

    const factory = new NodeCanvasFactory();
    const canvasAndContext = factory.create(viewport.width, viewport.height);

    await page.render({
      canvasContext: canvasAndContext.context as any,
      viewport,
      canvasFactory: {
        create: factory.create.bind(factory),
        reset: factory.reset.bind(factory),
        destroy: factory.destroy.bind(factory),
      },
    } as any).promise;

    /* ----------- Enhance Contrast + Grayscale ----------- */
    const ctx = canvasAndContext.context;
    const imageData = ctx.getImageData(0, 0, viewport.width, viewport.height);
    const data = imageData.data;

    for (let p = 0; p < data.length; p += 4) {
      const avg = (data[p] + data[p + 1] + data[p + 2]) / 3;
      const v = avg < 128 ? avg * 0.7 : avg * 1.35; // contrast boost
      data[p] = data[p + 1] = data[p + 2] = v;
    }

    ctx.putImageData(imageData, 0, 0);

    /* ----------- Crop Out CamScanner Watermark ----------- */
    const cropped = factory.create(viewport.width, viewport.height * 0.9);
    cropped.context.drawImage(
      canvasAndContext.canvas,
      0,
      0,
      viewport.width,
      viewport.height * 0.9,
      0,
      0,
      viewport.width,
      viewport.height * 0.9
    );

    const imgBuffer = cropped.canvas.toBuffer();

    /* ----------- Run OCR ----------- */
    const result = await Tesseract.recognize(imgBuffer, "eng", {
      logger: () => {},
    });

    fullText += result.data.text + "\n";
  }

  fullText = fullText.trim();
  if (!fullText) throw new Error("OCR returned no readable text");

  return fullText;
}
