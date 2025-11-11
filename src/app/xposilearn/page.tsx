"use client";
import Head from "next/head";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

// 🕒 Countdown Component
function Countdown({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(deadline).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("⏰ Deadline passed");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      let display = "";
      if (days > 0) display += `${days}d `;
      display += `${hrs}h ${mins}m ${secs}s`;

      setTimeLeft(`⏳ ${display}`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <p
      className={`text-xs mt-1 ${
        timeLeft.includes("passed") ? "text-gray-500" : "text-red-500 font-medium"
      }`}
    >
      {timeLeft}
    </p>
  );
}

export default function XPosiLearnPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [notesRes, papersRes, linksRes, assignmentsRes] = await Promise.all([
        supabase.from("uploads").select("*").eq("category", "notes"),
        supabase.from("uploads").select("*").eq("category", "papers"),
        supabase.from("links").select("*").order("created_at", { ascending: false }),
        supabase.from("assignments").select("*").order("deadline", { ascending: true }),
      ]);

      if (!notesRes.error) setNotes(notesRes.data || []);
      if (!papersRes.error) setPapers(papersRes.data || []);
      if (!linksRes.error) setLinks(linksRes.data || []);
      if (!assignmentsRes.error) setAssignments(assignmentsRes.data || []);
      setLoading(false);
    })();
  }, []);

  const groupByYear = (items: any[]) => {
    const grouped: Record<string, any[]> = {};
    items.forEach((item) => {
      const year = item.year || "other";
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(item);
    });
    return grouped;
  };

  const groupByCategory = (items: any[]) => {
    const grouped: Record<string, any[]> = {};
    items.forEach((item) => {
      const category = item.category || "Other";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    });
    return grouped;
  };

  const notesByYear = groupByYear(notes);
  const papersByYear = groupByYear(papers);
  const linksByCategory = groupByCategory(links);

  const yearOrder = ["year-1", "year-2", "year-3", "other"];
  const yearLabels: Record<string, string> = {
    "year-1": "Year 1",
    "year-2": "Year 2",
    "year-3": "Year 3",
    other: "Other",
  };

  return (
    <>
      <Head>
        <title>XPosiLearn — The XPosiGuide</title>
        <meta
          name="description"
          content="Study & revision: Download Notes, Past Papers, Assignments, and Educational Links."
        />
      </Head>

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
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 text-justify">
            {/* ================== NOTES ================== */}
            <div className="border rounded-2xl shadow-sm overflow-hidden bg-white flex flex-col">
              <div className="relative w-full aspect-[16/9] flex-shrink-0">
                <Image
                  src="/assets/xposilearn-note.png"
                  alt="Notes"
                  fill
                  className="object-contain bg-white p-2"
                />
              </div>
              <div className="p-5 flex-1 overflow-y-auto max-h-[480px] scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">Module Notes</h2>
                {notes.length === 0 ? (
                  <p className="text-sm text-gray-500">No notes yet.</p>
                ) : (
                  yearOrder.map((yearKey) => {
                    const files = notesByYear[yearKey];
                    if (!files) return null;
                    return (
                      <div key={yearKey} className="mb-5">
                        <h3 className="font-semibold text-blue-600 border-b mb-2">
                          {yearLabels[yearKey]}
                        </h3>
                        <ul className="space-y-1">
                          {files.map((n) => (
                            <li key={n.id}>
                              <a
                                href={n.file_url}
                                target="_blank"
                                className="text-blue-700 hover:underline text-sm"
                              >
                                📘 {n.filename}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ================== PAST PAPERS ================== */}
            <div className="border rounded-2xl shadow-sm overflow-hidden bg-white flex flex-col">
              <div className="relative w-full aspect-[16/9] flex-shrink-0">
                <Image
                  src="/assets/xposilearn-paper.jpg"
                  alt="Papers"
                  fill
                  className="object-contain bg-white p-2"
                />
              </div>
              <div className="p-5 flex-1 overflow-y-auto max-h-[480px] scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">Past Papers</h2>
                {papers.length === 0 ? (
                  <p className="text-sm text-gray-500">No papers yet.</p>
                ) : (
                  yearOrder.map((yearKey) => {
                    const files = papersByYear[yearKey];
                    if (!files) return null;
                    return (
                      <div key={yearKey} className="mb-5">
                        <h3 className="font-semibold text-blue-600 border-b mb-2">
                          {yearLabels[yearKey]}
                        </h3>
                        <ul className="space-y-1">
                          {files.map((p) => (
                            <li key={p.id}>
                              <a
                                href={p.file_url}
                                target="_blank"
                                className="text-blue-700 hover:underline text-sm"
                              >
                                📝 {p.filename}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ================== LINKS ================== */}
            <div className="border rounded-2xl shadow-sm overflow-hidden bg-white flex flex-col">
              <div className="relative w-full aspect-[16/9] flex-shrink-0">
                <Image
                  src="/assets/xposilearn-links.png"
                  alt="Links"
                  fill
                  className="object-contain bg-white p-2"
                />
              </div>
              <div className="p-5 flex-1 overflow-y-auto max-h-[480px] scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">Useful Links</h2>
                {links.length === 0 ? (
                  <p className="text-sm text-gray-500">No links yet.</p>
                ) : (
                  Object.entries(linksByCategory).map(([cat, catLinks]) => (
                    <div key={cat} className="mb-4">
                      <h3 className="font-semibold text-blue-600 border-b mb-2">{cat}</h3>
                      <ul className="space-y-1">
                        {catLinks.map((l) => (
                          <li key={l.id}>
                            <a
                              href={l.url}
                              target="_blank"
                              className="text-blue-700 hover:underline text-sm"
                            >
                              🌐 {l.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ================== ASSIGNMENTS ================== */}
            <div className="border rounded-2xl shadow-sm overflow-hidden bg-white flex flex-col">
              <div className="relative w-full aspect-[16/9] flex-shrink-0">
                <Image
                  src="/assets/xposilearn-assign.png"
                  alt="Assignments"
                  fill
                  className="object-contain bg-white p-2"
                />
              </div>

              <div className="p-5 flex-1 overflow-y-auto max-h-[480px] scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">Assignments</h2>

                {assignments.length === 0 ? (
                  <p className="text-sm text-gray-500">No assignments yet.</p>
                ) : (
                  <>
                    {yearOrder.map((yearKey) => {
                      const group = assignments.filter((a) => a.year === yearKey);
                      if (group.length === 0) return null;

                      return (
                        <div key={yearKey} className="mb-6">
                          <h3 className="font-semibold text-blue-600 border-b border-blue-100 pb-1 mb-3">
                            {yearKey === "other"
                              ? "Other"
                              : yearKey.replace("year-", "Year ")}
                          </h3>

                          <ul className="divide-y divide-gray-200 rounded-lg overflow-hidden border border-gray-100">
                            {group.map((a) => (
                              <li
                                key={a.id}
                                className="py-2 px-2 hover:bg-gray-50 transition"
                              >
                                <a
                                  href={a.file_url}
                                  target="_blank"
                                  className="block text-blue-700 hover:underline text-sm font-medium"
                                >
                                  📘 {a.title}
                                </a>
                                <p className="text-xs text-gray-500">
                                  Due:{" "}
                                  {a.deadline
                                    ? new Date(a.deadline).toLocaleString()
                                    : "No deadline set"}
                                </p>
                                {a.deadline && <Countdown deadline={a.deadline} />}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
