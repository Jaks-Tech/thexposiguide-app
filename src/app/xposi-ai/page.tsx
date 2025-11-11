import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseServer";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import XPosiAIClient from "./XPosiAIClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

/** 🧠 List all papers from Supabase (any file type) */
async function listAllPapers() {
  const { data, error } = await supabaseAdmin
    .from("uploads")
    .select("id, filename, file_url, path, year, category")
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
      <iframe src="${pdfUrl}#toolbar=0" width="100%" height="800" style="border:none; display:block; margin:0 auto;"></iframe>
    `;
    textForAI = `PDF document: ${filename}`;
  }
  // 🧾 Word Document (.docx / .doc)
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
        align-items: center;
        frameborder="0"
        style="border:none; display:block; margin:0 auto;"
      ></iframe>
    `;
    textForAI = `Microsoft Word document: ${filename}`;
  }
  // 🖼️ Image
  else if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) {
    const { data: publicData } = supabaseAdmin
      .storage.from("xposilearn")
      .getPublicUrl(path);
    const imgUrl = publicData?.publicUrl;
    htmlContent = `
      <div style="display:flex;justify-content:center;align-items: center;">
        <img src="${imgUrl}" alt="${filename}" style="max-width:100%;border-radius:12px;"/>
      </div>
    `;
    textForAI = `Image file: ${filename}`;
  }
  // 🎥 Video
  else if (["mp4", "mov", "webm"].includes(ext || "")) {
    const { data: publicData } = supabaseAdmin
      .storage.from("xposilearn")
      .getPublicUrl(path);
    const vidUrl = publicData?.publicUrl;
    htmlContent = `
      <div style="display:flex;justify-content:center;">
        <video controls width="100%" style="border-radius:12px;max-width:800px;">
          <source src="${vidUrl}" type="video/${ext}" />
          Your browser does not support video playback.
        </video>
      </div>`;
    textForAI = `Video file: ${filename}`;
  }
  // 🧱 Unsupported file types
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


        {/* 🤖 AI Assistant */}
        <section className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 text-center">
            🤖 Ask <span className="font-extrabold text-blue-800">XPosi AI</span>
          </h2>
          <p className="text-sm text-neutral-600 mb-5 text-center">
            Click below to generate AI-based guidance or explanations for this paper.
          </p>

          {/* Keep AI analysis text left-aligned */}
          <div className="flex flex-col items-stretch">
            <XPosiAIClient content={textForAI} />
          </div>

          <div className="mt-6 text-xs text-neutral-500 border-t border-blue-100 pt-3 text-center">
            <p>
              <strong>Note:</strong> This AI assistant provides educational explanations.
              Always confirm with institutional radiography standards.
            </p>
          </div>
        </section>

      </main>
    );
  }

  // Otherwise, list all papers
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 text-center mb-4">
        XPosi AI
      </h1>
      <p className="text-base sm:text-lg text-gray-500 text-center mb-12">
        Smart AI assistance for your past papers — learn faster, study smarter.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {papers.map((p) => (
          <a
            key={p.id}
            href={`/xposi-ai?file=${encodeURIComponent(p.filename)}`}
            className="block p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <h2 className="text-blue-700 font-bold text-lg mb-2 truncate">
              {p.filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")}
            </h2>
            <p className="text-sm text-neutral-500">
              {p.year ? `Year ${p.year}` : "General"}
            </p>
          </a>
        ))}
      </div>

      <footer className="mt-16 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
        <p>
          <strong>XPosi AI</strong> © {new Date().getFullYear()} — Educational
          use only. Always follow institutional standards.
        </p>
      </footer>
    </main>
  );
}
