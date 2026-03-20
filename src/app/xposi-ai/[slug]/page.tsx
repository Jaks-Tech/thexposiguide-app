import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseServer";
import Link from "next/link";
import XPosiAIClient from "../XPosiAIClient";

/* ------------------------------------------------------------ */
/* Fetch single paper                                           */
/* ------------------------------------------------------------ */
async function getPaperBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from("uploads")
    .select("*")
    .eq("category", "papers");

  if (error || !data) return null;

  return data.find((p) =>
    p.filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") === slug
  );
}

/* ------------------------------------------------------------ */
/* Render file                                                  */
/* ------------------------------------------------------------ */
async function renderFileAsHtml(path: string, filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();

  const { data: publicData } = supabaseAdmin.storage
    .from("xposilearn")
    .getPublicUrl(path);

  const publicUrl = publicData?.publicUrl;

  let htmlContent = "";

  if (ext === "pdf") {
    htmlContent = `
      <iframe 
        src="${publicUrl}#toolbar=0&zoom=page-width" 
        width="100%" 
        height="800px" 
        style="border:none; width:100%; border-radius:1.5rem;"
      ></iframe>
    `;
  } else if (["doc", "docx", "ppt", "pptx"].includes(ext || "")) {
    htmlContent = `
      <iframe 
        src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl || '')}" 
        width="100%" 
        height="800px" 
        style="border:none; width:100%; border-radius:1.5rem;"
      ></iframe>
    `;
  } else {
    htmlContent = `<div class="p-20 text-center text-slate-400 font-bold">Preview not supported for this format.</div>`;
  }

  return { htmlContent };
}

/* ------------------------------------------------------------ */
/* Page (Next.js 15 Async Params Fix)                            */
/* ------------------------------------------------------------ */
export default async function PaperPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // 1. Await the params for Next.js 15
  const { slug } = await params;

  // 2. Fetch Entry
  const entry = await getPaperBySlug(slug);
  if (!entry) notFound();

  // 3. Prepare Content
  const { htmlContent } = await renderFileAsHtml(entry.path, entry.filename);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col w-full">
      
      {/* 🧭 NAVIGATION */}
      <nav className="h-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl px-6 md:px-10 flex items-center sticky top-0 z-50">
        <div className="flex items-center gap-6 max-w-7xl mx-auto w-full">
          <Link 
            href="/xposi-ai" 
            className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-blue-600 hover:text-white rounded-2xl text-slate-500 transition-all duration-300 shadow-sm"
          >
            ←
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">XPosi AI Library</span>
            <h1 className="font-extrabold text-slate-900 text-lg leading-tight capitalize truncate max-w-[250px] md:max-w-none">
              {entry.filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")}
            </h1>
          </div>
        </div>
      </nav>

      {/* 📄 MAIN CONTENT (Vertical Layout) */}
      <main className="max-w-6xl mx-auto w-full p-6 md:p-10 flex flex-col gap-10">
        
        {/* SECTION 1: DOCUMENT PREVIEW */}
        <section className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Document Viewer</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold rounded-full">
                {entry.year?.replace("year-", "Y")}
              </span>
              <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold rounded-full">
                SEM {entry.semester}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[3rem] shadow-2xl shadow-blue-900/5 p-3 overflow-hidden">
            <div 
              className="rounded-[2.2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner"
              dangerouslySetInnerHTML={{ __html: htmlContent }} 
            />
          </div>
        </section>

        {/* SECTION 2: AI ASSISTANT (Below Preview) */}
        <section className="w-full flex flex-col gap-4">
          <div className="flex items-center gap-3 px-4">
            <span className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
              🤖
            </span>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">XPosi Neural Assistant</h2>
          </div>

          <div className="bg-white border border-blue-100 rounded-[3rem] shadow-2xl shadow-blue-900/5 overflow-hidden">
             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                <p className="text-sm font-medium opacity-90 leading-relaxed max-w-2xl">
                  Analyze this radiography document with AI. You can generate clinical summaries, 
                  extract anatomical focus points, or request sample quiz questions based on the text above.
                </p>
             </div>
             
             <div className="p-8 lg:p-12">
               <XPosiAIClient paperMeta={{ ...entry }} />
             </div>
          </div>
        </section>

      </main>

      {/* Footer Space */}
      <footer className="h-20" />
    </div>
  );
}