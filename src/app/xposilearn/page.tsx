"use client";
import Head from "next/head";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import ReturnToTop from "@/components/ReturnToTop";
import { useRouter } from "next/navigation";

/* --- HELPERS --- */
function normalizeYear(raw: string | null | undefined): string {
  if (!raw) return "Other";
  const text = raw.toLowerCase();
  if (text.includes("1")) return "Year 1";
  if (text.includes("2")) return "Year 2";
  if (text.includes("3")) return "Year 3";
  return "Other";
}

function groupByFlat(items: any[], key: string) {
  const result: Record<string, any[]> = {};
  items.forEach((i) => {
    const k = i[key] || "Other";
    if (!result[k]) result[k] = [];
    result[k].push(i);
  });
  return result;
}

function groupByHierarchy(items: any[]) {
  const out: Record<string, Record<number, Record<string, any[]>>> = {};
  items.forEach((item) => {
    const year = normalizeYear(item.year);
    const semester = item.semester ?? 1;
    const unitName = item.unit_name || "General";
    if (!out[year]) out[year] = {};
    if (!out[year][semester]) out[year][semester] = {};
    if (!out[year][semester][unitName]) out[year][semester][unitName] = [];
    out[year][semester][unitName].push(item);
  });
  return out;
}

/* --- MAIN PAGE --- */
export default function XPosiLearnPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const [notesRes, papersRes, linksRes] = await Promise.all([
        supabase.from("uploads").select("*").eq("category", "notes"),
        supabase.from("uploads").select("*").eq("category", "papers"),
        supabase.from("links").select("*").order("created_at", { ascending: false }),
      ]);
      if (!notesRes.error) setNotes(notesRes.data || []);
      if (!papersRes.error) setPapers(papersRes.data || []);
      if (!linksRes.error) setLinks(linksRes.data || []);
      setLoading(false);
    })();
  }, []);

  const openViewer = (item: any) => {
    const id = item.id || item.slug;
    router.push(`/xposilearn/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans">
      <Head><title>XPosiLearn — The XPosiGuide</title></Head>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <header className="mb-20">
          <div className="relative max-w-3xl mx-auto text-center p-10 md:p-12 rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/60 shadow-sm">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent mb-4 tracking-tight">
              XPosiLearn
            </h1>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
              Your centralized academic library. Browse notes, past papers, and curated resources.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700 mb-4"></div>
            <p className="text-gray-400 italic">Preparing your library...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <UniversalSectionCard title="Module Notes" image="/assets/xposilearn-note.png" groups={groupByHierarchy(notes)} isHierarchical onOpen={openViewer} />
            <UniversalSectionCard title="Past Papers" image="/assets/xposilearn-paper.jpg" groups={groupByHierarchy(papers)} isHierarchical onOpen={openViewer} />
            <UniversalSectionCard title="Useful Links" image="/assets/xposilearn-links.png" groups={groupByFlat(links, "category")} isHierarchical={false} onOpen={openViewer} />
          </div>
        )}
      </main>
      <ReturnToTop />
    </div>
  );
}

/* --- SECTION CARD COMPONENT --- */
function UniversalSectionCard({ title, image, groups, onOpen, isHierarchical = false }: any) {
  const [openSemester, setOpenSemester] = useState<string | null>(null);
  const [openUnit, setOpenUnit] = useState<string | null>(null);

  // Logic to calculate totals for the "Collapsed" preview
  const getTotals = () => {
    let totalItems = 0;
    if (isHierarchical) {
      Object.values(groups).forEach((year: any) => {
        Object.values(year).forEach((sem: any) => {
          Object.values(sem).forEach((units: any) => { totalItems += units.length; });
        });
      });
    } else {
      Object.values(groups).forEach((cat: any) => { totalItems += cat.length; });
    }
    return totalItems;
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-white/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-500 overflow-hidden flex flex-col group">
      
      <div className="relative w-full aspect-video bg-gray-50 overflow-hidden">
        <Image src={image} alt={title} fill className="object-contain p-8 group-hover:scale-105 transition-transform duration-500" />
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">{title}</h2>

        {/* --- DYNAMIC PREVIEW CONTENT (Shows only when collapsed) --- */}
        {!openSemester && (
          <div className="mb-4 p-4 rounded-2xl bg-blue-50/30 border border-blue-100/50 animate-in fade-in slide-in-from-top-2 duration-500">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Repository Status</span>
                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">LIVE</span>
             </div>
             <p className="text-sm text-slate-500 mt-2">
                Currently hosting <span className="text-blue-700 font-bold">{getTotals()}</span> verified {title.toLowerCase()}. Select a year to begin browsing.
             </p>
          </div>
        )}

        <div className="overflow-y-auto max-h-[400px] pr-2 space-y-2 custom-scrollbar">
          {!isHierarchical && Object.keys(groups).map((groupName) => (
            <div key={groupName} className="mb-4">
              <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">{groupName}</h3>
              <ul className="space-y-2">
                {groups[groupName].map((item: any) => (
                  <li key={item.id}>
                    <button onClick={() => onOpen(item)} className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 text-sm font-medium transition-all flex items-center gap-3">
                      🌐 {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {isHierarchical && Object.keys(groups).map((yearKey) => (
            <div key={yearKey} className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{yearKey}</h3>
              {Object.keys(groups[yearKey]).map((sem) => {
                const semId = `${yearKey}-sem-${sem}`;
                const isSelected = openSemester === semId;
                return (
                  <div key={semId} className="mb-2">
                    <button
                      onClick={() => setOpenSemester(isSelected ? null : semId)}
                      className={`w-full flex justify-between items-center p-3 rounded-xl font-semibold text-sm transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}`}
                    >
                      Semester {sem}
                      <span>{isSelected ? '▲' : '▼'}</span>
                    </button>

                    {isSelected && (
                      <div className="ml-2 mt-3 space-y-2 border-l-2 border-blue-100 pl-4 animate-in zoom-in-95 duration-200">
                        {Object.keys(groups[yearKey][sem]).map((unit) => {
                          const unitId = `${semId}-${unit}`;
                          const isUnitOpen = openUnit === unitId;
                          return (
                            <div key={unitId}>
                              <button onClick={() => setOpenUnit(isUnitOpen ? null : unitId)} className="text-xs font-bold text-gray-500 hover:text-blue-600 w-full text-left py-1 flex justify-between">
                                {unit} <span>{isUnitOpen ? '−' : '+'}</span>
                              </button>
                              {isUnitOpen && (
                                <ul className="mt-2 space-y-1">
                                  {groups[yearKey][sem][unit].map((file: any) => (
                                    <li key={file.id}>
                                      <button onClick={() => onOpen(file)} className="w-full text-left py-2 px-3 rounded-lg text-sm text-gray-600 hover:bg-white hover:shadow-sm hover:text-blue-700 transition-all">
                                        📘 {file.title || file.filename}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}