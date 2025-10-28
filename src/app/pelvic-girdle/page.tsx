import { listEntries } from "@/lib/md";
import EntryCard from "@/components/EntryCard";

export const metadata = {
  title: "Pelvic Girdle — The XPosiGuide",
  description: "X-ray positioning—Pelvic Girdle procedures and projections.",
};

export default async function PelvicGirdlePage() {
  const entries = await listEntries("pelvic");

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Centered Header */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-blue-600">
          Pelvic Girdle
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300 text-base sm:text-lg">
          Browse positioning guides.
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">
          No entries yet. Add <code>*.md</code> files under{" "}
          <code>/pelvic-girdle-content</code>.
        </p>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((e) => (
            <EntryCard
              key={e.slug}
              href={`/pelvic-girdle/${e.slug}`}
              entry={e}
              subdir="pelvic"
            />
          ))}
        </section>
      )}
    </main>
  );
}
