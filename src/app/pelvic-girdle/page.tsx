"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import EntryCard from "@/components/EntryCard";
import type { EntryMeta } from "@/lib/md";
import { loadEntryPreview } from "@/lib/md";
import ReturnToTop from "@/components/ReturnToTop";
export default function PelvicGirdlePage() {
  const [entries, setEntries] = useState<EntryMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEntries() {
      try {
        const { data, error } = await supabase
          .from("uploads")
          .select("filename, file_url, image_url, path, description, created_at")
          .eq("category", "module")
          .eq("module", "pelvic")
          .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);

        if (!data || data.length === 0) {
          console.warn("ℹ️ No pelvic entries found");
          setEntries([]);
          setLoading(false);
          return;
        }

        const formatted: EntryMeta[] = [];

        for (const e of data) {
          if (!e.filename) continue;
          const slug = e.filename.replace(/\.[^/.]+$/, "");

          // 🔥 Generate text preview from markdown (first 300 chars)
          let preview = "";
          try {
            preview = await loadEntryPreview("pelvic", slug, 300);
          } catch (err) {
            console.error(`⚠️ Failed to load preview for ${slug}:`, err);
            preview = e.description || "No description available.";
          }

          formatted.push({
            title: slug.replace(/[-_]/g, " "),
            slug,
            description: preview,
            image: e.image_url
              ? `${e.image_url}?width=1200&quality=70&resize=contain`
              : "/assets/placeholder.png",
            region: "Pelvic Girdle",
            projection: "",
            url: e.file_url,
          });
        }

        setEntries(formatted);
      } catch (err: any) {
        console.error("❌ Error fetching pelvic modules:", err.message);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEntries();
  }, []);

  if (loading) return <p className="text-center py-10">Loading...</p>;

  return (
    <>
      <Head>
        <title>Pelvic Girdle — The XPosiGuide</title>
        <meta
          name="description"
          content="X-ray positioning and projection techniques for the Pelvic Girdle region."
        />
      </Head>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* 🩻 Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-blue-600">Pelvic Girdle/Vertebral Column</h1>
          <p className="text-gray-600 mt-2">
            Explore standardized radiographic positioning for pelvic and hip anatomy...
          </p>
        </header>
        <ReturnToTop /> 
        {/* 🗂️ Content Section */}
        {entries.length === 0 ? (
          <p className="text-center text-gray-500">No modules uploaded yet.</p>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <EntryCard
                key={entry.slug}
                href={`/pelvic-girdle/${entry.slug}`}
                entry={entry}
                subdir="pelvic"
              />
            ))}
          </section>
        )}
      </main>
    </>
  );
}
