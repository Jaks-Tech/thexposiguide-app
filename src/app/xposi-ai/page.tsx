import { supabaseAdmin } from "@/lib/supabaseServer";
import Link from "next/link";
import { notFound } from "next/navigation";

// Components
import DisableAutoScrollXposiAI from "@/components/DisableAutoScrollXposiAI";
import ReturnToTop from "@/components/ReturnToTop";
import UnitBadge from "@/components/XposiAIColorCode";
import PaperFilters from "@/components/PaperFilters"; 

// Next.js Config
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

/* ------------------------------------------------------------ */
/* 🛠️ Data Fetching                                              */
/* ------------------------------------------------------------ */
async function listAllPapers() {
  const { data, error } = await supabaseAdmin
    .from("uploads")
    .select("id, filename, path, year, semester, unit_name, category")
    .eq("category", "papers")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase Fetch Error:", error.message);
    return [];
  }
  return data || [];
}

/* ------------------------------------------------------------ */
/* 🔤 Slug Generator (Must match your [slug] page logic)         */
/* ------------------------------------------------------------ */
function createSlug(filename: string) {
  return filename
    .replace(/\.[^/.]+$/, "") // Remove extension
    .replace(/[-_]/g, " ")    // Replace dashes/underscores with spaces
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");    // Replace spaces with single dashes
}

/* ------------------------------------------------------------ */
/* 🚀 Main Page Component                                        */
/* ------------------------------------------------------------ */
type SearchParams = Promise<{ year?: string; sem?: string; unit?: string }>;

export default async function XPosiAIPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  // 1. Await SearchParams (Mandatory in Next.js 15)
  const params = await searchParams;
  const { year, sem, unit } = params;

  // 2. Load Data
  const allPapers = await listAllPapers();

  // 3. Prepare unique filter values for the sidebar/dropdowns
  const years = Array.from(new Set(allPapers.map((p) => p.year))).filter(Boolean).sort() as string[];
  const sems = Array.from(new Set(allPapers.map((p) => p.semester))).filter(Boolean).sort() as (string | number)[];
  const units = Array.from(new Set(allPapers.map((p) => p.unit_name))).filter(Boolean).sort() as string[];

  // 4. Apply Filtering Logic
  const filteredPapers = allPapers.filter((p) => {
    const matchYear = !year || p.year === year;
    const matchSem = !sem || String(p.semester) === String(sem);
    const matchUnit = !unit || p.unit_name === unit;
    return matchYear && matchSem && matchUnit;
  });

  return (
    <>
      <DisableAutoScrollXposiAI />

      <div className="min-h-screen bg-[#F8FAFC]">
        
        {/* --- HERO HEADER --- */}
        <header className="relative bg-[#FDFDFE] border-b border-slate-100 pt-24 pb-12 overflow-hidden">
          {/* Decorative Background Grid */}
          <div
            className="absolute inset-0 z-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' viewBox=\'0 0 30 30\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0H0V1H30V0Z\' fill=\'%23cbd5e1\'/%3E%3Cpath d=\'M0 0V30H1V0H0Z\' fill=\'%23cbd5e1\'/%3E%3C/svg%3E")',
            }}
          />

          <div className="relative z-10 max-w-5xl mx-auto px-6">
            <div className="group relative flex flex-col items-center text-center px-10 py-16 rounded-[3rem] bg-white border border-slate-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.02)] transition-all duration-700 hover:shadow-[0_20px_60px_rgba(59,130,246,0.05)] mb-12">
              
              <div className="absolute inset-0 -z-10 rounded-[3rem] ring-[12px] ring-slate-100/40" />
              <div className="absolute inset-0 -z-10 rounded-[3rem] ring-[24px] ring-slate-50/30" />

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 text-blue-600 text-[11px] font-black tracking-[0.15em] border border-blue-100/50 mb-8 shadow-sm uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                Past Papers
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8">
                XPosi{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  AI
                </span>{" "}
                Library
              </h1>

              <p className="text-slate-500 text-lg md:text-2xl max-w-2xl leading-relaxed font-medium">
                The ultimate radiography resource. Select a paper to begin AI-powered 
                analysis, summarization, and exam preparation.
              </p>
            </div>
          </div>
        </header>



        {/* --- RESULTS GRID --- */}
          <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200">
            <PaperFilters years={years} sems={sems} units={units} />
          </div>
        <main className="max-w-7xl mx-auto px-6 py-12">
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
              {year || sem || unit ? 'Filtered Results' : 'Recently Uploaded'}
            </h2>

            <div className="h-px flex-1 bg-slate-100 mx-6 hidden sm:block"></div>

            <div className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
              Showing {filteredPapers.length} Documents
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPapers.map((p) => (
              <Link
                key={p.id}
                href={`/xposi-ai/${createSlug(p.filename)}`}
                className="group bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 hover:border-blue-400 transition-all duration-500 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-all duration-500 shadow-inner">
                    <span className="text-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      📄
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors capitalize">
                    {p.filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")}
                  </h3>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-lg border border-blue-100">
                    {p.year?.replace("year-", "Y") || "N/A"}
                  </span>

                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-lg border border-indigo-100">
                    SEM {p.semester}
                  </span>

                  {p.unit_name && <UnitBadge name={p.unit_name} />}
                </div>
              </Link>
            ))}
          </div>

          {/* --- EMPTY STATE --- */}
          {filteredPapers.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-inner">
              <div className="text-6xl mb-6 grayscale opacity-30 animate-pulse">📂</div>
              <h3 className="text-xl font-black text-slate-800">
                No matching papers found
              </h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2 italic">
                Try adjusting your filters or clearing them to see all available radiography papers.
              </p>
              <Link
                href="/xposi-ai"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                Reset All Filters
              </Link>
            </div>
          )}
        </main>

        <ReturnToTop />
      </div>
    </>
  );
}