"use client";
import Head from "next/head";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import EntryCard from "@/components/EntryCard";
import type { EntryMeta } from "@/lib/md";

export default function LowerExtremitiesPage() {
  const [entries, setEntries] = useState<EntryMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("uploads")
        .select("filename, file_url, image_url, path")
        .eq("category", "module")
        .eq("module", "lower")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching lower modules:", error.message);
        setEntries([]);
      } else {
        const formatted: EntryMeta[] =
          data?.map((e) => ({
            title: e.filename.replace(/\.[^/.]+$/, ""),
            slug: e.filename.replace(/\.[^/.]+$/, ""),
            description: "",
            image: e.image_url || "/assets/placeholder.png",
            region: "",
            projection: "",
            url: e.file_url,
          })) || [];
        setEntries(formatted);
      }

      setLoading(false);
    })();
  }, []);

  return (
    <>
      <Head>
        <title>Lower Extremities — The XPosiGuide</title>
        <meta
          name="description"
          content="X-ray positioning — Lower Extremities procedures and projections."
        />
      </Head>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-600">Lower Extremities</h1>
          <p className="text-gray-600 mt-2">Browse positioning guides.</p>
        </header>

        {loading ? (
          <p className="text-center text-gray-500">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-gray-500">No modules uploaded yet.</p>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <EntryCard
                key={entry.slug}
                href={entry.url || "#"}
                entry={entry}
                subdir="lower"
              />
            ))}
          </section>
        )}
      </main>
    </>
  );
}
