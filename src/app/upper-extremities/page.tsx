import { listEntries } from "@/lib/md";
import EntryCard from "@/components/EntryCard";

export const metadata = {
  title: "Upper Extremities — The XPosiGuide",
  description: "X-ray positioning — Upper Extremities procedures and projections.",
};

export default async function UpperExtremitiesPage() {
  const entries = await listEntries("upper");

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-blue-600">
          Upper Extremities
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300 text-base sm:text-lg">
          Browse positioning guides for radiographic procedures of the upper limb.
        </p>
      </header>

      {/* Content */}
      {entries.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">
          No entries yet. Add <code>*.md</code> files under{" "}
          <code>/public/illustrations/upper/</code> or your content directory.
        </p>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((e, index) => (
            <EntryCard
              key={`${e.slug}-${index}`} // ✅ guarantees unique key
              href={`/upper-extremities/${e.slug}`}
              entry={e}
              subdir="upper"
            />
          ))}
        </section>
      )}
    </main>
  );
}
