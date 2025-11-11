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
            Study & revision: Notes, Past Papers, and educational links.
          </p>
        </header>

        {loading ? (
          <p className="text-center text-gray-500">Loading…</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Notes */}
            <div className="border rounded-2xl shadow-sm overflow-hidden">
              <div className="relative w-full aspect-[16/9]">
                <Image src="/assets/xposilearn-note.png" alt="Notes" fill className="object-contain bg-white p-2" />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">Module Notes</h2>
                {notes.length === 0 ? (
                  <p className="text-sm text-gray-500">No notes yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {notes.map((n) => (
                      <li key={n.path}>
                        <a href={n.file_url} className="text-blue-700 hover:underline">
                          📘 {n.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Papers */}
            <div className="border rounded-2xl shadow-sm overflow-hidden">
              <div className="relative w-full aspect-[16/9]">
                <Image src="/assets/xposilearn-paper.jpg" alt="Papers" fill className="object-contain bg-white p-2" />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">Past Papers</h2>
                {papers.length === 0 ? (
                  <p className="text-sm text-gray-500">No papers yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {papers.map((p) => (
                      <li key={p.path}>
                        <a href={p.file_url} className="text-blue-700 hover:underline">
                          📝 {p.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="border rounded-2xl shadow-sm overflow-hidden">
              <div className="relative w-full aspect-[16/9]">
                <Image src="/assets/xposilearn-links.png" alt="Links" fill className="object-contain bg-white p-2" />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">Useful Links</h2>
                {links.length === 0 ? (
                  <p className="text-sm text-gray-500">No links yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {links.map((l) => (
                      <li key={l.id}>
                        <a href={l.url} target="_blank" className="text-blue-700 hover:underline">
                          🌐 {l.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
