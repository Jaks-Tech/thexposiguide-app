"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ResourceViewerPage() {
  const { slug } = useParams();

  const [viewerHtml, setViewerHtml] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorUrl, setErrorUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      setErrorUrl(null);

      // 1. Fetch from 'uploads'
      const { data } = await supabase
        .from("uploads")
        .select("*")
        .or(`id.eq.${slug},slug.eq.${slug}`)
        .maybeSingle();

      if (data) {
        const filename = data.filename || data.path?.split("/").pop() || data.title;
        const ext = filename?.split(".").pop()?.toLowerCase();
        const { data: pub } = supabase.storage.from("xposilearn").getPublicUrl(data.path);
        processResource(pub?.publicUrl, filename, ext);
      } else {
        // 2. Fallback to 'links'
        const { data: link } = await supabase
          .from("links")
          .select("*")
          .eq("id", slug)
          .maybeSingle();

        if (link) {
          processResource(link.url, link.name, "url");
        }
      }
      setLoading(false);
    };

    const processResource = (url: string, name: string, ext?: string) => {
      setTitle(name);
      let html = "";
      const frameStyle = `style="border:none; width:100%; height:100%; display:block; border-radius:16px;"`;

      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = url.includes("v=") ? url.split("v=")[1]?.split("&")[0] : url.split("/").pop();
        html = `<iframe src="https://www.youtube.com/embed/${videoId}" ${frameStyle} allowfullscreen></iframe>`;
      } 
      else if (url.includes("tiktok.com")) {
        const videoId = url.split("/video/")[1]?.split("?")[0];
        if (videoId) {
          html = `<iframe src="https://www.tiktok.com/embed/v2/${videoId}" ${frameStyle} allowfullscreen></iframe>`;
        } else {
          setErrorUrl(url);
        }
      }
      else if (["doc", "docx", "ppt", "pptx"].includes(ext || "")) {
        html = `<iframe src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}" ${frameStyle}></iframe>`;
      }
      else if (ext === "pdf") {
        html = `<iframe src="${url}#toolbar=0" ${frameStyle}></iframe>`;
      }
      else {
        html = `<iframe src="${url}" ${frameStyle}></iframe>`;
        setErrorUrl(url);
      }
      setViewerHtml(html);
    };

    load();
  }, [slug]);

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="flex-none h-16 px-6 border-b border-gray-100 bg-white flex items-center z-20">
        <div className="absolute left-4">
          <a href="/xposilearn" className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-all text-blue-600">
             <span className="text-xl font-bold">←</span>
          </a>
        </div>

        <div className="flex-1 flex justify-center px-16">
          <h1 className="font-bold text-gray-800 text-sm md:text-base tracking-tight truncate text-center max-w-xl">
            {title}
          </h1>
        </div>
        
        <div className="absolute right-4">
          {errorUrl && (
            <a href={errorUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95">
              Open ↗
            </a>
          )}
        </div>
      </header>

      {/* VIEWER AREA */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6 bg-gray-50/30">
        
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
          </div>
        ) : (
          /* THE UPDATED WINDOW: Full Height, Maintained Width */
          <div className="w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-200 relative overflow-hidden">
            <div 
              className="absolute inset-0 w-full h-full"
              dangerouslySetInnerHTML={{ __html: viewerHtml }} 
            />
          </div>
        )}

      </main>

      <footer className="flex-none py-3 bg-white border-t border-gray-50 text-center">
        <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
          XPosiLearn Studio
        </p>
      </footer>
    </div>
  );
}