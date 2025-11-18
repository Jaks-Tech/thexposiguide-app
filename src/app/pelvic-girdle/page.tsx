import { listEntries, loadEntryPreview } from "@/lib/md";
import EntryCard from "@/components/EntryCard";
import Head from "next/head";
import ReturnToTop from "@/components/ReturnToTop";

export default async function PelvicGirdlePage() {
  // Fetch metadata for pelvic markdown entries
  const entries = await listEntries("pelvic");

  // Fetch preview text for each entry
  const entriesWithPreview = await Promise.all(
    entries.map(async (entry) => {
      const preview = await loadEntryPreview("pelvic", entry.slug);
      return { ...entry, description: preview };
    })
  );

  return (
    <>
      <Head>
        <title>Pelvic Girdle — The XPosiGuide</title>
        <meta
          name="description"
          content="X-ray positioning — Pelvic Girdle & vertebral column projections and techniques."
        />
      </Head>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* HEADER */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-600">
            Pelvic Girdle / Vertebral Column
          </h1>
          <p className="text-gray-600 mt-2">
            Explore standardized radiographic positioning for pelvic and spine anatomy...
          </p>
        </header>

        <ReturnToTop />

        {/* GRID */}
        {entriesWithPreview.length === 0 ? (
          <p className="text-center text-gray-500">No modules uploaded yet.</p>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entriesWithPreview.map((entry) => (
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
