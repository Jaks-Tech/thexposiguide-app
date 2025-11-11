"use client";
import Head from "next/head";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function XPosiLearnPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch data from Supabase
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

  // 🧠 Helper to group items by year
  const groupByYear = (items: any[]) => {
    const grouped: Record<string, any[]> = {};
    items.forEach((item) => {
      const year = item.year || "other";
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(item);
    });
    return grouped;
  };

  // 🧠 Helper to group links by category
  const groupByCategory = (items: any[]) => {
    const grouped: Record<string, any[]> = {};
    items.forEach((item) => {
      const category = item.category || "Other";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    });
    return grouped;
  };

  // 🧩 Group the notes and papers by year
  const notesByYear = groupByYear(notes);
  const papersByYear = groupByYear(papers);
  const linksByCategory = groupByCategory(links);

  const yearOrder = ["year-1", "year-2", "year-3"];
  const yearLabels: Record<string, string> = {
    "year-1": "Year 1",
    "year-2": "Year 2",
    "year-3": "Year 3",
  };

  return (
    <>
      <Head>
        <title>XPosiLearn — The XPosiGuide</title>
        <meta
          name="description"
          content="Study & revision: Download Notes, Past Papers, and explore educational links."
        />
      </Head>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-600">XPosiLearn</h1>
          <p className="text-gray-600">
            Study & revision: Download Notes, Past Papers, and explore categorized educational links.
          </p>
        </header>

        {loading ? (
          <p className="text-center text-gray-500">Loading…</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* ================== MODULE NOTES ================== */}
            <div className="border rounded-2xl shadow-sm overflow-hidden bg-white">
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src="/assets/xposilearn-note.png"
                  alt="Notes"
                  fill
                  className="object-contain bg-white p-2"
                />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">
                  Module Notes
                </h2>
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
                                className="text-blue-700 hover:underline text-sm"
                                target="_blank"
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
            <div className="border rounded-2xl shadow-sm overflow-hidden bg-white">
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src="/assets/xposilearn-paper.jpg"
                  alt="Papers"
                  fill
                  className="object-contain bg-white p-2"
                />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">
                  Past Papers
                </h2>
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
                                className="text-blue-700 hover:underline text-sm"
                                target="_blank"
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

            {/* ================== USEFUL LINKS ================== */}
            <div className="border rounded-2xl shadow-sm overflow-hidden bg-white">
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src="/assets/xposilearn-links.png"
                  alt="Links"
                  fill
                  className="object-contain bg-white p-2"
                />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">
                  Useful Educational Links
                </h2>
                {links.length === 0 ? (
                  <p className="text-sm text-gray-500">No links yet.</p>
                ) : (
                  Object.entries(linksByCategory).map(([cat, catLinks]) => (
                    <div key={cat} className="mb-4">
                      <h3 className="font-semibold text-blue-600 border-b mb-2">
                        {cat}
                      </h3>
                      <ul className="space-y-1">
                        {catLinks.map((l) => (
                          <li key={l.id}>
                            <a
                              href={l.url}
                              target="_blank"
                              rel="noopener noreferrer"
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
          </div>
        )}
      </main>
    </>
  );
}
