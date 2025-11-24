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

/* ------------------------------------------------------------ */
/* 🧠 Fetch all uploaded papers                                 */
/* ------------------------------------------------------------ */
async function listAllPapers() {
  const { data, error } = await supabaseAdmin
    .from("uploads")
    .select(`
      id,
      filename,
      path,
      year,
      semester,
      unit_name,
      category
    `)
    .eq("category", "papers")
    .order("created_at", { ascending: false });

  if (error) return [];

  return data || [];
}

/* ------------------------------------------------------------ */
/* 🧩 Convert file to HTML preview                              */
/* ------------------------------------------------------------ */
async function renderFileAsHtml(path: string, filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();

  const { data: fileData, error } = await supabaseAdmin.storage
    .from("xposilearn")
    .download(path);

  if (error || !fileData) notFound();

  let htmlContent = "";
  let textForAI = "";

  if (ext === "md") {
    const text = await fileData.text();
    const { content } = matter(text);
    const processed = await remark().use(html).process(content);
    htmlContent = processed.toString();
    textForAI = content;
  }

  else if (ext === "pdf") {
    const { data: publicData } = supabaseAdmin
      .storage.from("xposilearn")
      .getPublicUrl(path);

    const pdfUrl = publicData?.publicUrl;

    htmlContent = `
      <iframe src="${pdfUrl}#toolbar=0"
        width="100%" height="1400"
        style="border:none; display:block;">
      </iframe>
    `;
    textForAI = `PDF document: ${filename}`;
  }

  else if (["doc", "docx"].includes(ext || "")) {
    const { data: publicData } = supabaseAdmin
      .storage.from("xposilearn")
      .getPublicUrl(path);

    const wordUrl = publicData?.publicUrl;

    htmlContent = `
      <iframe
        src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(wordUrl)}"
        width="100%" height="1400"
        style="border:none; display:block;">
      </iframe>
    `;
    textForAI = `Word document: ${filename}`;
  }

  else if (["ppt", "pptx"].includes(ext || "")) {
    const { data: publicData } = supabaseAdmin
      .storage.from("xposilearn")
      .getPublicUrl(path);

    const pptUrl = publicData?.publicUrl;

    htmlContent = `
      <iframe
        src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pptUrl)}"
        width="100%" height="1400"
        style="border:none; display:block;">
      </iframe>
    `;
    textForAI = `PowerPoint: ${filename}`;
  }

  else if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) {
    const { data: publicData } = supabaseAdmin
      .storage.from("xposilearn")
      .getPublicUrl(path);

    const imgUrl = publicData?.publicUrl;

    htmlContent = `
      <img src="${imgUrl}" alt="${filename}"
        style="width:100%; border-radius:12px;" />
    `;
    textForAI = `Image: ${filename}`;
  }

  else {
    htmlContent = `<p>Preview not supported for this file type.</p>`;
    textForAI = `Unsupported file type: ${filename}`;
  }

  return { htmlContent, textForAI };
}

/* ------------------------------------------------------------ */
/* 📘 MAIN PAGE                                                 */
/* ------------------------------------------------------------ */
export default async function XPosiAIPage({ searchParams }: any) {
  const { file } = await searchParams;
  const papers = await listAllPapers();

  /* ========= WHEN A FILE IS OPENED ========= */
  if (file) {
    const entry = papers.find((p) => p.filename === file);
    if (!entry) notFound();

    const { htmlContent } = await renderFileAsHtml(entry.path, entry.filename);

    return (
      <main className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10 py-10">

        {/* Back button */}
        <a href="/xposi-ai" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
          ← Back to Papers
        </a>

        {/* Title */}
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-2">
            {entry.filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")}
          </h1>
          <p className="text-neutral-600">AI-powered insights for radiography past papers.</p>
        </header>

          {/* === TWO-COLUMN LAYOUT (FULLY STYLED) === */}
          <div className="
            grid grid-cols-1 lg:grid-cols-2 
            gap-10 items-start
            bg-gradient-to-br from-blue-50 to-white
            p-6 rounded-2xl shadow-xl
            border border-blue-100
          ">

            {/* LEFT: PREVIEW COLUMN */}
            <div className="w-full h-full">

              {/* Sticky Header */}
              <div className="
                sticky top-0 z-10 
                bg-blue-100/70 backdrop-blur 
                p-3 rounded-xl 
                flex items-center justify-center gap-2 
                shadow-md border border-blue-200
                mb-4
              ">
                <span className="text-blue-700 text-xl animate-pulse">📄</span>
                <h2 className="text-lg font-semibold text-blue-800">
                  Paper Preview
                </h2>
              </div>

              {/* Preview Card */}
              <div className="bg-white border border-neutral-200 shadow-md rounded-xl p-3">
                <article
                  className="
                    w-full h-full
                    prose dark:prose-invert
                    [&_iframe]:w-full
                    [&_iframe]:h-[1500px]
                    [&_img]:w-full
                    [&_img]:rounded-xl
                  "
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>

            </div>

            {/* RIGHT: XPOSI AI COLUMN */}
            <div className="w-full h-full flex flex-col">

              {/* Sticky Header */}
              <div className="
                sticky top-0 z-10 
                bg-blue-100/70 backdrop-blur 
                p-3 rounded-xl 
                flex items-center justify-center gap-2 
                shadow-md border border-blue-200
                mb-4
              ">
                <span className="text-blue-700 text-xl animate-bounce">🤖</span>
                <h2 className="text-lg font-semibold text-blue-800">
                  XPosi AI Assistant
                </h2>
              </div>

              {/* AI Section Card */}
              <div className="
                bg-white border border-neutral-200 shadow-md 
                rounded-xl p-3 h-full flex flex-col
              ">
                <XPosiAIClient
                  paperMeta={{
                    id: entry.id,
                    filename: entry.filename,
                    path: entry.path,
                    year: entry.year,
                    semester: entry.semester,
                    unit_name: entry.unit_name,
                  }}
                />
              </div>

            </div>

          </div>


      </main>
    );
  }

  /* ========= DEFAULT (LIST OF PAPERS) ========= */
  return (
    <>
      <DisableAutoScrollXPosiAI />

      <main className="w-full">
        {/* Your existing default page code unchanged */}
        {/* ... */}
      </main>
    </>
  );
}
