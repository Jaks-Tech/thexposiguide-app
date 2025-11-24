import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseServer";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import XPosiAIClient from "./XPosiAIClient";
import PDFChatClient from "./PDFChatClient"; 
import DisableAutoScrollXPosiAI from "@/components/DisableAutoScrollXposiAI";
import ReturnToTop from "@/components/ReturnToTop";
import UnitBadge from "@/components/XposiAIColorCode";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

/** 🧠 List all papers from Supabase (any file type) */
async function listAllPapers() {
    const { data, error } = await supabaseAdmin
      .from("uploads")
      .select(`
        id,
        filename,
        file_url,
        path,
        year,
        semester,
        unit_name,
        category
      `)
      .eq("category", "papers")
      .order("created_at", { ascending: false });


  if (error) {
    console.error("❌ Error fetching papers:", error.message);
    return [];
  }

  return data || [];
}

/** 🧩 Load and render file content as HTML */
async function renderFileAsHtml(path: string, filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();

  const { data: fileData, error } = await supabaseAdmin.storage
    .from("xposilearn")
    .download(path);

  if (error || !fileData) {
    console.error("❌ Could not download file:", error);
    notFound();
  }

  let htmlContent = "";
  let textForAI = "";

// 📝 Markdown
if (ext === "md") {
  const text = await fileData.text();
  const { content } = matter(text);
  const processed = await remark().use(html).process(content);

  htmlContent = processed.toString();
  textForAI = content;
}

// 📄 PDF
else if (ext === "pdf") {
  const { data: publicData } = supabaseAdmin
    .storage.from("xposilearn")
    .getPublicUrl(path);

  const pdfUrl = publicData?.publicUrl;

  htmlContent = `
    <iframe src="${pdfUrl}#toolbar=0" width="100%" height="800" 
      style="border:none; display:block; margin:0 auto;">
    </iframe>
  `;

  textForAI = `PDF document: ${filename}`;
}

// 🧾 Word Documents (.docx / .doc)
else if (["docx", "doc"].includes(ext || "")) {
  const { data: publicData } = supabaseAdmin
    .storage.from("xposilearn")
    .getPublicUrl(path);

  const wordUrl = publicData?.publicUrl;

  htmlContent = `
    <iframe
      src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        wordUrl
      )}"
      width="100%"
      height="800"
      frameborder="0"
      style="border:none; display:block; margin:0 auto;">
    </iframe>
  `;

  textForAI = `Microsoft Word document: ${filename}`;
}

// 📊 PowerPoint (.pptx / .ppt)
else if (["pptx", "ppt"].includes(ext || "")) {
  const { data: publicData } = supabaseAdmin
    .storage.from("xposilearn")
    .getPublicUrl(path);

  const pptUrl = publicData?.publicUrl;

  htmlContent = `
    <iframe
      src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        pptUrl
      )}"
      width="100%"
      height="800"
      frameborder="0"
      style="border:none; display:block; margin:0 auto;">
    </iframe>
  `;

  textForAI = `PowerPoint presentation file: ${filename}`;
}

// 🖼️ Images
else if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) {
  const { data: publicData } = supabaseAdmin
    .storage.from("xposilearn")
    .getPublicUrl(path);

  const imgUrl = publicData?.publicUrl;

  htmlContent = `
    <div style="display:flex;justify-content:center;align-items:center;">
      <img src="${imgUrl}" alt="${filename}" 
        style="max-width:100%;border-radius:12px;"/>
    </div>
  `;

  textForAI = `Image file: ${filename}`;
}

// 🎥 Videos
else if (["mp4", "mov", "webm"].includes(ext || "")) {
  const { data: publicData } = supabaseAdmin
    .storage.from("xposilearn")
    .getPublicUrl(path);

  const vidUrl = publicData?.publicUrl;

  htmlContent = `
    <div style="display:flex;justify-content:center;">
      <video controls width="100%" 
        style="border-radius:12px;max-width:800px;">
        <source src="${vidUrl}" type="video/${ext}" />
        Your browser does not support video playback.
      </video>
    </div>
  `;

  textForAI = `Video file: ${filename}`;
}

// 🧱 Unsupported
else {
  htmlContent = `<p class="text-gray-600 text-center">Preview not supported for this file type: ${ext}</p>`;
  textForAI = `Unsupported file type: ${filename}`;
}

return { htmlContent, textForAI };

}

/** 📘 XPosi AI Main Page */
export default async function XPosiAIPage({
  searchParams,
}: {
  searchParams: Promise<{ file?: string }>;
}) {
  const { file } = await searchParams;
  const papers = await listAllPapers();

  // If user opened a specific file
  if (file) {
    const entry = papers.find((p) => p.filename === file);
    if (!entry) notFound();

    const { htmlContent, textForAI } = await renderFileAsHtml(
      entry.path,
      entry.filename
    );

    return (
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
          {/* 🔥 FIX SCROLL JUMP */}
          <style>{`
            html {
              scroll-behavior: auto !important;
            }
          `}</style>
        <div className="mb-6">
          <a
            href="/xposi-ai"
            className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
          >
            ← Back to Papers
          </a>
        </div>

        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-3">
            {entry.filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")}
          </h1>
          <p className="text-neutral-600">
            AI-powered insights for radiography past papers.
          </p>
        </header>

        {/* 📄 File Viewer */}
        <section className="bg-blue-50 border border-neutral-200 rounded-8xl shadow-sm p-6 mb-20">
          <article
            className="prose dark:prose-invert max-w-none text-center [&_img]:mx-auto [&_iframe]:mx-auto [&_iframe]:block"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </section>


        {/* 📘 NEW AI WORKFLOW — STEP SYSTEM */}
      <section className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-6 shadow-md mt-12">

        <h2 className="text-2xl font-semibold text-blue-700 mb-4 text-center">
          🤖 Get AI Assistance for this Paper...
        </h2>

        <p className="text-sm text-neutral-700 text-center mb-6">
          Before XPosi AI can generate full answers for this paper, it must first extract the text.
        </p>

        {/* STEP INDICATOR */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              1
            </div>
            <p className="text-xs mt-2 font-medium text-blue-700">Upload Paper</p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold">
              2
            </div>
            <p className="text-xs mt-2 font-medium text-yellow-600">Extract Text</p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
              3
            </div>
            <p className="text-xs mt-2 font-medium text-green-700">Generate Answers</p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-4 items-center">

          {/* STEP 1 BUTTON */}
          <button
            className="w-full max-w-xs py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            📥 Upload This Paper for AI
          </button>

          {/* STEP 2 BUTTON */}
          <button
            className="w-full max-w-xs py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 disabled:bg-yellow-300"
            disabled
          >
            🔍 Extract Text (after upload)
          </button>

          {/* STEP 3 BUTTON */}
          <button
            className="w-full max-w-xs py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:bg-green-300"
            disabled
          >
            🧠 Generate Full Answers
          </button>
        </div>

        <p className="text-xs text-center mt-6 text-neutral-500">
          The AI will only generate results after your document text is fully extracted.
        </p>

      </section>


        
      </main>
    );
  }


// Otherwise, list all papers + NEW PDF chat system
return (
  <>
  <DisableAutoScrollXPosiAI />
  <main className="w-full">

    {/* ------------------------------------ */}
    {/* SECTION 1 — Past Papers (WHITE)      */}
    {/* ------------------------------------ */}

        <section className="w-full bg-white py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

            <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 text-center mb-4">
              XPosi AI
            </h1>

            <p className="text-base sm:text-lg text-gray-500 text-center mb-12">
              Smart AI assistance for your past papers — learn faster, study smarter.
            </p>

            {/* ⭐ Improved Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">

              {papers.map((p) => (
                <a
                  key={p.id}
                  href={`/xposi-ai?file=${encodeURIComponent(p.filename)}`}
                  className="
                    block p-6 rounded-3xl 
                    border border-neutral-200 
                    bg-white
                    shadow-sm 
                    transition-all duration-300 
                    hover:shadow-xl hover:-translate-y-1 hover:border-blue-200
                  "
                >
                  {/* FILE TITLE */}
                  <h2 className="text-blue-700 font-semibold text-lg mb-3 leading-snug h-12 overflow-hidden">
                    {(p.filename || "")
                      .replace(/\.[^/.]+$/, "")
                      .replace(/[-_]/g, " ")
                      .substring(0, 60)}
                    {p.filename.length > 60 ? "…" : ""}
                  </h2>

                  {/* BADGES */}
                  <div className="flex flex-wrap gap-2 mt-2">

                    {/* YEAR */}
                    {p.year && (
                      <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {p.year.replace("year-", "Year ")}
                      </span>
                    )}

                    {/* SEMESTER */}
                    {p.semester && (
                      <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        S{p.semester}
                      </span>
                    )}

                    {/* UNIT (Color-coded) */}
                    {p.unit_name && <UnitBadge name={p.unit_name} />}
                  </div>

                </a>
              ))}

            </div>
          </div>
        </section>



    {/* ------------------------------------ */}
    {/* SECTION 2 — Chat with Your PDF (BLUE) */}
    {/* ------------------------------------ */}

    <section className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-white">

        <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-center">
          Chat with Your Own PDF
        </h2>

        <p className="text-sm sm:text-base text-blue-100 text-center max-w-2xl mx-auto mb-8">
          Upload any radiography PDF (notes, protocol, guideline) and ask XPosi AI 
          questions. Answers are based only on the content of your PDF.
        </p>

        <div className="bg-white/95 rounded-2xl p-4 sm:p-6 shadow-xl max-w-3xl mx-auto">
          <PDFChatClient />
        </div>

        <p className="mt-6 text-[11px] sm:text-xs text-blue-100 text-center">
          XPosi PDF AI is for education only. Always confirm with institutional policies and protocols.
        </p>

      </div>
    </section>
    <ReturnToTop />

    {/* ------------------------------------ */}
    {/* FOOTER                               */}
    {/* ------------------------------------ */}

    <footer className="w-full bg-white border-t border-neutral-200 py-6 text-center text-sm text-neutral-500">
      <p>
        <strong>XPosi AI</strong> © {new Date().getFullYear()} — Educational use only.
        Always follow institutional standards.
      </p>
    </footer>

  </main>
  </>
);

}
