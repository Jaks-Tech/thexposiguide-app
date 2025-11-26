"use client";
import Head from "next/head";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import ReturnToTop from "@/components/ReturnToTop";

/* ---------------------------------------------------------
   UNIVERSAL FILE VIEWER (supports all file types)
--------------------------------------------------------- */
async function renderFileAsHtml(path: string, filename: string) {
  const ext: string = filename.split(".").pop()?.toLowerCase() || "";

  const { data: pub } = supabase.storage.from("xposilearn").getPublicUrl(path);
  const url: string = pub?.publicUrl || "";

  let htmlContent = "";

  if (ext === "pdf") {
    htmlContent = `<iframe src="${url}#toolbar=0" width="100%" height="100%" style="border:none;"></iframe>`;
  } else if (["doc", "docx", "ppt", "pptx"].includes(ext)) {
    htmlContent = `
      <iframe src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        url
      )}" width="100%" height="100%" style="border:none;"></iframe>
    `;
  } else if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
    htmlContent = `
      <div style="display:flex;justify-content:center;align-items:center;height:100%;">
        <img src="${url}" style="max-width:100%;max-height:100%;border-radius:10px;" />
      </div>
    `;
  } else if (["mp4", "mov", "webm"].includes(ext)) {
    htmlContent = `
      <div style="display:flex;justify-content:center;align-items:center;height:100%;">
        <video controls style="max-height:100%;border-radius:10px;">
          <source src="${url}" type="video/${ext}" />
        </video>
      </div>
    `;
  } else {
    htmlContent = `<iframe src="${url}" width="100%" height="100%" style="border:none;"></iframe>`;
  }

  return { htmlContent };
}

/* ---------------------------------------------------------
   COUNTDOWN COMPONENT
--------------------------------------------------------- */
function Countdown({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const end = new Date(deadline).getTime();
      const diff = end - now;

      if (diff <= 0) return setTimeLeft("⏰ Deadline passed");

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`⏳ ${d}d ${h}h ${m}m ${s}s`);
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <p
      className={`text-xs mt-1 ${
        timeLeft.includes("passed")
          ? "text-gray-500"
          : "text-red-500 font-medium"
      }`}
    >
      {timeLeft}
    </p>
  );
}

/* ---------------------------------------------------------
   HELPERS: NORMALIZATION & GROUPING
--------------------------------------------------------- */

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
    if (!out[year][semester][unitName])
      out[year][semester][unitName] = [];

    out[year][semester][unitName].push(item);
  });

  return out;
}

/* ---------------------------------------------------------
   MAIN PAGE
--------------------------------------------------------- */
export default function XPosiLearnPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [viewerHtml, setViewerHtml] = useState("");
  const [viewedName, setViewedName] = useState("");

  useEffect(() => {
    (async () => {
      const [notesRes, papersRes, linksRes, assignmentsRes] =
        await Promise.all([
          supabase.from("uploads").select("*").eq("category", "notes"),
          supabase.from("uploads").select("*").eq("category", "papers"),
          supabase
            .from("links")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("assignments")
            .select("*")
            .order("deadline", { ascending: true }),
        ]);

      if (!notesRes.error) setNotes(notesRes.data || []);
      if (!papersRes.error) setPapers(papersRes.data || []);
      if (!linksRes.error) setLinks(linksRes.data || []);
      if (!assignmentsRes.error) setAssignments(assignmentsRes.data || []);

      setLoading(false);
    })();
  }, []);

const openViewer = async (item: any) => {
  // Prefer actual stored filename
  let filename = item.filename;

  // If no filename (assignments), extract from path
  if (!filename && item.path) {
    filename = item.path.split("/").pop(); // get actual uuid.pdf
  }

  // If still nothing, fallback to title
  if (!filename) {
    filename = item.title || "File";
  }

  const path = item.path || "";
  const fileUrl = item.file_url || item.url || null;

  // LINKS
  if (item.url && item.category === "links") {
    window.open(item.url, "_blank");
    return;
  }

  // Use universal renderer if path exists
  if (path) {
    setViewedName(filename);
    const { htmlContent } = await renderFileAsHtml(path, filename);
    setViewerHtml(htmlContent);
    setSelectedFile(item);
    return;
  }

  // Otherwise render from fileUrl
  if (fileUrl) {
    setViewedName(filename);
    const ext = filename.split(".").pop()?.toLowerCase() || "";

    let html = "";

    if (ext === "pdf") {
      html = `<iframe src="${fileUrl}#toolbar=0" width="100%" height="100%" style="border:none;"></iframe>`;
    } else if (["doc","docx","ppt","pptx"].includes(ext)) {
      html = `
        <iframe 
          src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}"
          width="100%" height="100%" style="border:none;">
        </iframe>
      `;
    } else if (["jpg","jpeg","png","gif","webp"].includes(ext)) {
      html = `
        <div style="display:flex;justify-content:center;align-items:center;height:100%;">
          <img src="${fileUrl}" style="max-width:100%;max-height:100%;"/>
        </div>
      `;
    } else if (["mp4","mov","webm"].includes(ext)) {
      html = `
        <div style="display:flex;justify-content:center;align-items:center;height:100%;">
          <video controls style="max-height:100%;">
            <source src="${fileUrl}" type="video/${ext}" />
          </video>
        </div>
      `;
    } else {
      html = `<iframe src="${fileUrl}" width="100%" height="100%" style="border:none;"></iframe>`;
    }

    setViewerHtml(html);
    setSelectedFile(item);
  }
};



  const closeViewer = () => {
    setSelectedFile(null);
    setViewerHtml("");
  };

  /* GROUPING WITH NEW UNIT_NAME */
  const groupedNotes = groupByHierarchy(notes);
  const groupedPapers = groupByHierarchy(papers);
  const groupedAssignments = groupByHierarchy(assignments);
  const linksByCat = groupByFlat(links, "category");

  return (
    <>
      <Head>
        <title>XPosiLearn — The XPosiGuide</title>
      </Head>

      {/* MODAL VIEWER */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="relative bg-white rounded-xl w-[95%] h-[90%] overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 right-0 bg-white/95 border-b p-3 flex justify-between items-center z-10">
              <span className="font-semibold text-blue-700">
                {viewedName}
              </span>
              <button
                onClick={closeViewer}
                className="bg-red-500 text-white px-3 py-1 rounded-full shadow hover:bg-red-600"
              >
                Close ✕
              </button>
            </div>

            <div
              className="w-full h-full pt-12"
              dangerouslySetInnerHTML={{ __html: viewerHtml }}
            />
          </div>
        </div>
      )}

      {/* MAIN PAGE */}
      <main className="mx-auto max-w-7xl px-4 py-10">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-600">XPosiLearn</h1>
          <p className="text-gray-600">
            Study & revision: Notes, Past Papers, Assignments, and Educational
            Links.
          </p>
        </header>

        {loading ? (
          <p className="text-center text-gray-500">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {/* NOTES */}
            <UniversalSectionCard
              title="Module Notes"
              image="/assets/xposilearn-note.png"
              groups={groupedNotes}
              isHierarchical
              onOpen={openViewer}
            />

            {/* PAPERS */}
            <UniversalSectionCard
              title="Past Papers"
              image="/assets/xposilearn-paper.jpg"
              groups={groupedPapers}
              isHierarchical
              onOpen={openViewer}
            />

            {/* LINKS (flat) */}
            <UniversalSectionCard
              title="Useful Links"
              image="/assets/xposilearn-links.png"
              groups={linksByCat}
              isHierarchical={false}
              onOpen={openViewer}
            />

            {/* ASSIGNMENTS */}
            <UniversalSectionCard
              title="Assignments"
              image="/assets/xposilearn-assign.png"
              groups={groupedAssignments}
              isHierarchical
              showDeadlines
              onOpen={openViewer}
            />
          </div>
        )}
      </main>
      <ReturnToTop />
    </>
  );
}

function UniversalSectionCard({
  title,
  image,
  groups,
  onOpen,
  showDeadlines = false,
  isHierarchical = false,
}: any) {
  // Sort years properly
  const sortYearKeys = (keys: string[]) => {
    const score = (y: string) => {
      const t = y.toLowerCase();
      if (t.includes("1")) return 1;
      if (t.includes("2")) return 2;
      if (t.includes("3")) return 3;
      return 99;
    };
    return [...keys].sort((a, b) => score(a) - score(b));
  };

  /* ---------------------------------------------------------
      DEFAULT OPEN LOGIC (Year 1 → Semester 1 → First Unit)
  --------------------------------------------------------- */
  const firstYear = isHierarchical ? sortYearKeys(Object.keys(groups))[0] : null;
  const firstSemester =
    firstYear && groups[firstYear]
      ? Number(Object.keys(groups[firstYear])[0])
      : null;

  const firstUnit =
    firstYear &&
    firstSemester !== null &&
    groups[firstYear] &&
    groups[firstYear][firstSemester]
      ? Object.keys(groups[firstYear][firstSemester])[0]
      : null;

  const [openSemester, setOpenSemester] = useState<string | null>(
    firstYear && firstSemester !== null
      ? `${firstYear}-sem-${firstSemester}`
      : null
  );

  const [openUnit, setOpenUnit] = useState<string | null>(
    firstYear && firstSemester !== null && firstUnit
      ? `${firstYear}-sem-${firstSemester}-unit-${firstUnit}`
      : null
  );

  // Toggle handlers
  const toggleSemester = (year: string, sem: number) => {
    const id = `${year}-sem-${sem}`;
    setOpenSemester(openSemester === id ? null : id);
  };

  const toggleUnit = (year: string, sem: number, unit: string) => {
    const id = `${year}-sem-${sem}-unit-${unit}`;
    setOpenUnit(openUnit === id ? null : id);
  };

  /* ---------------------------------------------------------
      RENDER COMPONENT
  --------------------------------------------------------- */
  return (
    <div className="
      rounded-3xl 
      bg-white 
      shadow-[0_4px_20px_rgba(0,0,0,0.05)]
      hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]
      transition-all 
      duration-300 
      overflow-hidden 
      flex 
      flex-col 
      text-left
      hover:scale-[1.02]
    ">


      {/* Banner */}
      <div className="relative w-full aspect-[16/9]">
        <Image src={image} alt={title} fill className="object-contain bg-white p-2" />
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-y-auto max-h-[600px]">

        <h2 className="text-2xl font-bold text-blue-700 mb-5 tracking-tight">
        {title}
      </h2>


        {/* ---------------------------------------------------------
           FLAT MODE (Useful Links)
        --------------------------------------------------------- */}
        {!isHierarchical &&
          Object.keys(groups).map((groupName) => (
            <div key={groupName} className="mb-6">
              <h3 className="font-semibold text-blue-600 border-b mb-2">{groupName}</h3>

              <ul className="divide-y divide-gray-200 border rounded-lg overflow-hidden">
                {groups[groupName].map((item: any) => (
                  <li
                    key={item.id}
                    className="py-2 px-3 hover:bg-gray-50 transition"
                  >
                    <button
                      onClick={() => onOpen(item)}
                      className="text-blue-700 hover:underline text-sm font-medium"
                    >
                      🌐 {item.name}
                    </button>
                  </li>
                ))}
              </ul>

              
            </div>
          ))}

        {/* ---------------------------------------------------------
           HIERARCHICAL MODE
           Year → Collapsible Semester → Collapsible Unit
        --------------------------------------------------------- */}
        {isHierarchical &&
          sortYearKeys(Object.keys(groups)).map((yearKey) => {
            const semesters = groups[yearKey];
            const semesterKeys = Object.keys(semesters)
              .map(Number)
              .sort((a, b) => a - b);

            return (
              <div key={yearKey} className="mb-6">

                {/* YEAR LABEL */}
                <h3 className="text-blue-700 text-lg font-semibold border-b mb-3">
                  {yearKey}
                </h3>

                {/* SEMESTERS */}
                {semesterKeys.map((sem) => {
                  const semesterId = `${yearKey}-sem-${sem}`;
                  const units = semesters[sem];
                  const unitNames = Object.keys(units).sort();

                  return (
                    <div key={semesterId} className="mb-4">

                      {/* ▼ SEMESTER COLLAPSIBLE BUTTON ▼ */}
                      <button
                        onClick={() => toggleSemester(yearKey, sem)}
                        className="w-full text-left py-1 px-2 mb-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm flex justify-between items-center"
                      >
                        Semester {sem}
                        <span>{openSemester === semesterId ? "▲" : "▼"}</span>
                      </button>

                      {/* SEMESTER CONTENT */}
                      {openSemester === semesterId && (
                        <div className="pl-3 border-l border-blue-200">

                          {unitNames.map((unitName) => {
                            const unitId = `${yearKey}-sem-${sem}-unit-${unitName}`;
                            const items = units[unitName];

                            return (
                              <div key={unitId} className="mb-3">

                                {/* ▼ UNIT COLLAPSIBLE BUTTON ▼ */}
                                <button
                                  onClick={() => toggleUnit(yearKey, sem, unitName)}
                                  className="w-full text-left py-1 px-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs flex justify-between items-center"
                                >
                                  {unitName}
                                  <span>{openUnit === unitId ? "▲" : "▼"}</span>
                                </button>

                                {/* UNIT CONTENT */}
                                {openUnit === unitId && (
                                  <div className="pl-3 mt-2 border-l border-gray-300">

                                    {/* Compact Tag Row */}
                                    <div className="flex flex-wrap items-center gap-2 mb-2 text-[0.65rem]">
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">
                                        {yearKey}
                                      </span>
                                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                                        S{sem}
                                      </span>
                                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full font-medium">
                                        {unitName}
                                      </span>
                                    </div>

                                    {/* FILE LIST */}
                                    <ul className="divide-y divide-gray-200 border rounded-lg overflow-hidden">
                                      {items.map((item: any) => (
                                        <li
                                          key={item.id}
                                          className="py-2 px-3 hover:bg-gray-50 transition"
                                        >
                                          <button
                                            onClick={() => onOpen(item)}
                                            className="text-blue-700 hover:underline text-sm font-medium"
                                          >
                                            📘 {item.title || item.filename}
                                          </button>

                                          {/* Deadlines */}
                                          {showDeadlines && item.deadline && (
                                            <>
                                              <p className="text-xs text-gray-500">
                                                Due:{" "}
                                                {new Date(
                                                  item.deadline
                                                ).toLocaleString()}
                                              </p>
                                              <Countdown deadline={item.deadline} />
                                            </>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
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
              
            );
          })}
      </div>
      
    </div>
    
  );
}