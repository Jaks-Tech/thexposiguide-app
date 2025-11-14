import { listEntries, loadEntryPreview } from "@/lib/md";
import EntryCard from "@/components/EntryCard";
import Head from "next/head";
import ReturnToTop from "@/components/ReturnToTop";
export default async function UpperExtremitiesPage() {
  // Fetch metadata from uploads table
  const entries = await listEntries("upper");

  // Fetch preview text for each entry
  const entriesWithPreview = await Promise.all(
    entries.map(async (entry) => {
      const preview = await loadEntryPreview("upper", entry.slug);
      return { ...entry, description: preview };
    })
  );

  return (
    <>
      <Head>
        <title>Upper Extremities — The XPosiGuide</title>
        <meta
          name="description"
          content="X-ray positioning — Upper Extremities procedures and projections."
        />
      </Head>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-600">Upper Extremities</h1>
          <p className="text-gray-600 mt-2">
            Explore standardized radiographic positioning for upper-limb anatomy...
          </p>
        </header>
      <ReturnToTop />
        {entriesWithPreview.length === 0 ? (
          <p className="text-center text-gray-500">No modules uploaded yet.</p>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entriesWithPreview.map((entry) => (
              <EntryCard
                key={entry.slug}
                href={`/upper-extremities/${entry.slug}`}
                entry={entry}
                subdir="upper"
              />
              
            ))}
          </section>
        )}
      </main>
    </>
  );
}
