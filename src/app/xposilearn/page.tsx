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

  // Fetch public URL for Supabase-stored files
  const { data: pub } = supabase.storage
    .from("xposilearn")
    .getPublicUrl(path);

  const url: string = pub?.publicUrl || "";

  let htmlContent = "";

  // PDF
  if (ext === "pdf") {
    htmlContent = `
      <iframe src="${url}#toolbar=0" width="100%" height="100%" style="border:none;"></iframe>
    `;
  }

  // DOC / DOCX
  else if (["doc", "docx"].includes(ext)) {
    htmlContent = `
      <iframe 
        src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}" 
        width="100%" height="100%" style="border:none;">
      </iframe>
    `;
  }

  // PPT / PPTX
  else if (["ppt", "pptx"].includes(ext)) {
    htmlContent = `
      <iframe 
        src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}" 
        width="100%" height="100%" style="border:none;">
      </iframe>
    `;
  }

  // Images
  else if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
    htmlContent = `
      <div style="display:flex;justify-content:center;align-items:center;height:100%;">
        <img src="${url}" style="max-width:100%;max-height:100%;border-radius:10px;" />
      </div>
    `;
  }

  // Videos
  else if (["mp4", "mov", "webm"].includes(ext)) {
    htmlContent = `
      <div style="display:flex;justify-content:center;align-items:center;height:100%;">
        <video controls style="max-height:100%;border-radius:10px;">
          <source src="${url}" type="video/${ext}" />
        </video>
      </div>
    `;
  }

  // Fallback
  else {
    htmlContent = `
      <iframe src="${url}" width="100%" height="100%" style="border:none;"></iframe>
    `;
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
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
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
   MAIN PAGE
--------------------------------------------------------- */
export default function XPosiLearnPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [viewerHtml, setViewerHtml] = useState<string>("");
  const [viewedName, setViewedName] = useState<string>("");

  const UNSPECIFIED = "Unspecified";

  const normalizeItems = (items: any[]) =>
    items.map((item) => ({
      ...item,
      year: item.year || UNSPECIFIED,
      semester: item.semester || UNSPECIFIED,
      unitName: item.unitName || item.unit || UNSPECIFIED,
    }));

  const groupByYearSemesterUnit = (
    items: any[]
  ): Record<string, Record<string, Record<string, any[]>>> => {
    const grouped: Record<string, Record<string, Record<string, any[]>>> = {};

    items.forEach((item) => {
      const yearKey = item.year || UNSPECIFIED;
      const semesterKey = item.semester || UNSPECIFIED;
      const unitKey = item.unitName || UNSPECIFIED;

      if (!grouped[yearKey]) grouped[yearKey] = {};
      if (!grouped[yearKey][semesterKey]) grouped[yearKey][semesterKey] = {};
      if (!grouped[yearKey][semesterKey][unitKey])
        grouped[yearKey][semesterKey][unitKey] = [];

      grouped[yearKey][semesterKey][unitKey].push(item);
    });

    return grouped;
  };

  /* Load data */
  useEffect(() => {
    (async () => {
      const [notesRes, papersRes, linksRes, assignmentsRes] = await Promise.all([
        supabase.from("uploads").select("*").eq("category", "notes"),
        supabase.from("uploads").select("*").eq("category", "papers"),
        supabase.from("links").select("*").order("created_at", { ascending: false }),
        supabase.from("assignments").select("*").order("deadline", { ascending: true }),
      ]);

      if (!notesRes.error) setNotes(normalizeItems(notesRes.data));
      if (!papersRes.error) setPapers(normalizeItems(papersRes.data));
      if (!linksRes.error) setLinks(linksRes.data || []);
      if (!assignmentsRes.error) setAssignments(normalizeItems(assignmentsRes.data));

      setLoading(false);
    })();
  }, []);

  /* ---------------------------------------------------------
     OPEN VIEWER (UNIVERSAL HANDLER: notes, papers, assignments, links)
  --------------------------------------------------------- */
/* ---------------------------------------------------------
   OPEN VIEWER (files open in modal, links open in new tab)
--------------------------------------------------------- */
  const openViewer = async (item: any) => {
    let path = item.path || "";
    let filename = item.filename || item.title || item.name || "File";
    let fileUrl = item.file_url || item.url || null;

    // Check: is this a LINK?
    // Links have `url` field. Files do not.
    if (item.url) {
      // Open links in a new browser tab
      window.open(item.url, "_blank", "noopener,noreferrer");
      return;
    }

    // Case 1: Supabase file (notes, papers, assignments)
    if (path) {
      setViewedName(filename);
      const { htmlContent } = await renderFileAsHtml(path, filename);
      setViewerHtml(htmlContent);
      setSelectedFile(item);
      return;
    }

    // Case 2: Direct file URL (assignments stored without path)
    if (fileUrl) {
      setViewedName(filename);
      const ext = filename.split(".").pop()?.toLowerCase() || "";
      let html = "";

      if (ext === "pdf") {
        html = `<iframe src="${fileUrl}#toolbar=0" width="100%" height="100%" style="border:none;"></iframe>`;
      } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
        html = `<div style="display:flex;justify-content:center;align-items:center;height:100%;">
                  <img src="${fileUrl}" style="max-width:100%;max-height:100%;" />
                </div>`;
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

  /* Grouping */
  const notesByYearSemesterUnit = groupByYearSemesterUnit(notes);
  const papersByYearSemesterUnit = groupByYearSemesterUnit(papers);
  const assignmentsByYearSemesterUnit = groupByYearSemesterUnit(assignments);
  const groupBy = (items: any[], key: string) => {
    const grouped: Record<string, any[]> = {};
    items.forEach((i) => {
      const k = i[key] || "other";
      if (!grouped[k]) grouped[k] = [];
      grouped[k].push(i);
    });
    return grouped;
  };

  const linksByCat = groupBy(links, "category");

  const yearOrder = ["year-1", "year-2", "year-3", UNSPECIFIED];
  const yearLabels: any = {
    "year-1": "Year 1",
    "year-2": "Year 2",
    "year-3": "Year 3",
    [UNSPECIFIED]: UNSPECIFIED,
  };

  return (
    <>
      <Head>
        <title>XPosiLearn — The XPosiGuide</title>
      </Head>

      {/* ---------------------------------------------------------
         🔥 FULLSCREEN MODAL VIEWER
      --------------------------------------------------------- */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="relative bg-white rounded-xl w-[95%] h-[90%] overflow-hidden shadow-xl">

            {/* header */}
            <div className="absolute top-0 left-0 right-0 bg-white/95 border-b p-3 flex justify-between items-center z-10">
              <span className="font-semibold text-blue-700">{viewedName}</span>
              <button
                onClick={closeViewer}
                className="bg-red-500 text-white px-3 py-1 rounded-full shadow hover:bg-red-600"
              >
                Close ✕
              </button>
            </div>

            {/* content */}
            <div className="w-full h-full pt-12" dangerouslySetInnerHTML={{ __html: viewerHtml }} />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
         MAIN PAGE
      --------------------------------------------------------- */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-600">XPosiLearn</h1>
          <p className="text-gray-600">
            Study & revision: Notes, Past Papers, Assignments, and Educational Links.
          </p>
        </header>

        {loading ? (
          <p className="text-center text-gray-500">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

          {/* NOTES */}
          <UniversalSectionCard
            title="Module Notes"
            image="/assets/xposilearn-note.png"
            groups={notesByYearSemesterUnit}
            groupLabels={yearLabels}
            yearOrder={yearOrder}
            unspecifiedLabel={UNSPECIFIED}
            onOpen={openViewer}
          />

          {/* PAPERS */}
          <UniversalSectionCard
            title="Past Papers"
            image="/assets/xposilearn-paper.jpg"
            groups={papersByYearSemesterUnit}
            groupLabels={yearLabels}
            yearOrder={yearOrder}
            unspecifiedLabel={UNSPECIFIED}
            onOpen={openViewer}
          />

          {/* LINKS */}
          <LinksSectionCard
            title="Useful Links"
            image="/assets/xposilearn-links.png"
            groups={linksByCat}
            onOpen={openViewer}
          />

          {/* ASSIGNMENTS */}
          <UniversalSectionCard
            title="Assignments"
            image="/assets/xposilearn-assign.png"
            groups={assignmentsByYearSemesterUnit}
            groupLabels={yearLabels}
            yearOrder={yearOrder}
            showDeadlines={true}
            unspecifiedLabel={UNSPECIFIED}
            onOpen={openViewer}
          />


          </div>
        )}
      </main>
    </>
  );
}

/* ---------------------------------------------------------
   UNIVERSAL SECTION CARD (Notes, Papers, Links, Assignments)
--------------------------------------------------------- */
function UniversalSectionCard({
  title,
  image,
  groups,
  groupLabels,
  yearOrder = [],
  unspecifiedLabel = "Unspecified",
  onOpen,
  showDeadlines = false,
}: any) {
  const getOrderedKeys = (keys: string[], preferredOrder: string[] = []) => {
    const preferred = preferredOrder.filter((key) => keys.includes(key));
    const remaining = keys
      .filter((key) => !preferredOrder.includes(key))
      .sort((a, b) => a.localeCompare(b));
    return [...preferred, ...remaining];
  };

  const yearKeys = getOrderedKeys(Object.keys(groups || {}), yearOrder);

  return (
    <div className="border rounded-2xl shadow-sm overflow-hidden bg-white flex flex-col text-left">
      {/* Image Banner */}
      <div className="relative w-full aspect-[16/9]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain bg-white p-2"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex-1 overflow-y-auto max-h-[600px]">

        {/* Card Title */}
        <h2 className="text-xl font-semibold text-blue-700 mb-4">
          {title}
        </h2>

        {/* Groups */}
        {yearKeys.map((yearKey) => {
          const semesters = groups[yearKey];
          if (!semesters) return null;

          const semesterKeys = getOrderedKeys(Object.keys(semesters), [unspecifiedLabel]);

          return (
            <div key={yearKey} className="mb-6">
              {/* Year Label */}
              <h3 className="font-semibold text-blue-600 border-b mb-2">
                {groupLabels[yearKey] || yearKey}
              </h3>

              <div className="space-y-4">
                {semesterKeys.map((semesterKey) => {
                  const units = semesters[semesterKey];
                  if (!units) return null;

                  const unitKeys = getOrderedKeys(Object.keys(units), [unspecifiedLabel]);

                  return (
                    <div key={semesterKey} className="pl-2">
                      <h4 className="text-blue-500 font-medium mb-2">
                        {semesterKey}
                      </h4>

                      <div className="space-y-3">
                        {unitKeys.map((unitKey) => {
                          const items = units[unitKey];
                          if (!items || items.length === 0) return null;

                          return (
                            <div key={unitKey} className="pl-2">
                              <p className="text-sm font-semibold text-gray-700 mb-1">
                                {unitKey}
                              </p>
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
                                      {title === "Useful Links"
                                        ? `🌐 ${item.name}`
                                        : title === "Assignments"
                                        ? `📘 ${item.title}`
                                        : `📘 ${item.filename}`}
                                    </button>

                                    {showDeadlines && item.deadline && (
                                      <>
                                        <p className="text-xs text-gray-500">
                                          Due: {new Date(item.deadline).toLocaleString()}
                                        </p>
                                        <Countdown deadline={item.deadline} />
                                      </>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <ReturnToTop />
            </div>
          );
        })}

      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   LINKS CARD (Original grouping by category)
--------------------------------------------------------- */
function LinksSectionCard({ title, image, groups, onOpen }: any) {
  return (
    <div className="border rounded-2xl shadow-sm overflow-hidden bg-white flex flex-col text-left">
      <div className="relative w-full aspect-[16/9]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain bg-white p-2"
        />
      </div>

      <div className="p-5 flex-1 overflow-y-auto max-h-[600px]">
        <h2 className="text-xl font-semibold text-blue-700 mb-4">{title}</h2>

        {Object.keys(groups).map((groupKey) => {
          const items = groups[groupKey];
          if (!items || items.length === 0) return null;

          return (
            <div key={groupKey} className="mb-6">
              <h3 className="font-semibold text-blue-600 border-b mb-2">
                {groupKey}
              </h3>

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
                      🌐 {item.name}
                    </button>
                  </li>
                ))}
              </ul>

              <ReturnToTop />
            </div>
          );
        })}
      </div>
    </div>
  );
}
