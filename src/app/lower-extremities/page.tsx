import Head from "next/head";
import EntryCard from "@/components/EntryCard";
import { listEntries, loadEntryPreview } from "@/lib/md";
import ReturnToTop from "@/components/ReturnToTop";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LowerExtremitiesPage() {
  // 1️⃣ Fetch entries from Supabase
  const entries = await listEntries("lower");

  // 2️⃣ Fetch preview text for each entry
  const entriesWithPreview = await Promise.all(
    entries.map(async (entry) => {
      const preview = await loadEntryPreview("lower", entry.slug, 300);
      return { ...entry, description: preview };
    })
  );

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
        {/* PAGE HEADER */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-600">Lower Extremities</h1>
          <p className="text-gray-600 mt-2">
            Explore standardized radiographic positioning for lower-limb anatomy...
          </p>
        </header>
        <ReturnToTop />
        {/* CONTENT OR EMPTY STATES */}
        {entriesWithPreview.length === 0 ? (
          <p className="text-center text-gray-500">No modules uploaded yet.</p>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entriesWithPreview.map((entry) => (
              <EntryCard
                key={entry.slug}
                href={`/lower-extremities/${entry.slug}`}
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
