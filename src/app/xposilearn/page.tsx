import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** 📘 Helper to list note files of all formats */
function listNotesFiles(year: "year-1" | "year-2" | "year-3") {
  const root = process.cwd();
  const dir = path.join(root, "public", "xposilearn", "notes", year);
  if (!fs.existsSync(dir)) return [];

  const allowedExts = [
    ".pdf", ".ppt", ".pptx", ".doc", ".docx", ".txt", ".xls", ".xlsx",
  ];

  return fs
    .readdirSync(dir)
    .filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return allowedExts.includes(ext) && !f.startsWith(".");
    })
    .map((f) => ({
      name: f,
      url: `/xposilearn/notes/${year}/${f}`,
    }));
}

/** 📝 Helper to list past paper files */
function listPaperFiles(year: "year-1" | "year-2" | "year-3") {
  const root = process.cwd();
  const dir = path.join(root, "public", "xposilearn", "papers", year);
  if (!fs.existsSync(dir)) return [];

  const allowedExts = [
    ".pdf", ".ppt", ".pptx", ".doc", ".docx", ".txt", ".xls", ".xlsx", ".md",
  ];

  return fs
    .readdirSync(dir)
    .filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return allowedExts.includes(ext) && !f.startsWith(".");
    })
    .map((f) => ({
      name: f,
      url: `/xposilearn/papers/${year}/${f}`,
    }));
}

/** 🌐 Helper to load categorized educational links */
function loadUsefulLinks() {
  const root = process.cwd();
  const filePath = path.join(root, "public", "xposilearn", "useful-links.json");
  if (!fs.existsSync(filePath)) return [];

  try {
    const jsonData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (err) {
    console.error("Error reading useful-links.json:", err);
    return [];
  }
}

/** 🔠 Group links by category */
function groupByCategory(links: { name: string; url: string; category?: string }[]) {
  const grouped: Record<string, { name: string; url: string; category?: string }[]> = {};
  for (const link of links) {
    const cat = link.category || "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(link);
  }
  return grouped;
}

export default async function XPosiLearnPage() {
  const years = ["year-1", "year-2", "year-3"] as const;
  const notes = Object.fromEntries(years.map((y) => [y, listNotesFiles(y)]));
  const papers = Object.fromEntries(years.map((y) => [y, listPaperFiles(y)]));

  const links = loadUsefulLinks();
  const groupedLinks = groupByCategory(links);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600">
          XPosiLearn
        </h1>
        <p className="mt-2 text-neutral-700 max-w-3xl mx-auto">
          Study & revision: Download Notes, Past Papers, and explore categorized educational links.
        </p>
      </header>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Notes Card */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition">
          <div className="relative w-full aspect-[16/9]">
            <Image
              src="/assets/xposilearn-note.png"
              alt="Module Notes"
              fill
              className="object-contain bg-white p-2"
            />
          </div>
          <div className="p-5 text-left">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-700 mb-5">
              Module Notes
            </h2>

            {years.map((y, i) => (
              <div key={y} className="mb-6 border-t border-neutral-200 pt-4">
                <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-2">
                  Year {i + 1}
                </h3>
                {notes[y].length === 0 ? (
                  <p className="text-sm text-neutral-500">No notes yet.</p>
                ) : (
                  <ul className="space-y-2 mt-1">
                    {notes[y].map((f) => (
                      <li key={f.url}>
                        <a
                          href={f.url}
                          download
                          className="text-sm text-blue-700 hover:underline"
                        >
                          📘 {f.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Past Papers Card */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition">
          <div className="relative w-full aspect-[16/9]">
            <Image
              src="/assets/xposilearn-paper.jpg"
              alt="Past Papers"
              fill
              className="object-contain bg-white p-2"
            />
          </div>
          <div className="p-5 text-left">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-700 mb-5">
              Past Papers
            </h2>

            {years.map((y, i) => (
              <div key={y} className="mb-6 border-t border-neutral-200 pt-4">
                <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-2">
                  Year {i + 1}
                </h3>
                {papers[y].length === 0 ? (
                  <p className="text-sm text-neutral-500">No past papers yet.</p>
                ) : (
                  <ul className="space-y-2 mt-1">
                    {papers[y].map((f) => (
                      <li key={f.url}>
                        <a
                          href={f.url}
                          download
                          className="text-sm text-blue-700 hover:underline"
                        >
                          📝 {f.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 🌐 Useful Educational Links Card */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition">
          <div className="relative w-full aspect-[16/9]">
            <Image
              src="/assets/xposilearn-links.png"
              alt="Useful Educational Links"
              fill
              className="object-contain bg-white p-2"
            />
          </div>
          <div className="p-5 text-left">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-700 mb-5">
              Useful Educational Links
            </h2>

            {links.length === 0 ? (
              <p className="text-sm text-neutral-500">No links added yet.</p>
            ) : (
              Object.entries(groupedLinks).map(([category, catLinks]) => (
                <div key={category} className="mb-5 border-t border-neutral-200 pt-4">
                  <h3 className="text-lg font-bold text-blue-600 mb-2">
                    {category}
                  </h3>
                  <ul className="space-y-2">
                    {catLinks.map((link, index) => (
                      <li key={`${link.url}-${index}`}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-700 hover:underline"
                        >
                          🌐 {link.name}
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

      {/* Footer */}
      <footer className="mt-14 border-t border-neutral-200 pt-6 pb-8 text-sm text-neutral-500 text-center px-4">
        <p className="max-w-2xl mx-auto">
          <strong>Disclaimer:</strong> Educational use only. Always follow
          institutional protocols and radiologist guidance.
        </p>
      </footer>
    </main>
  );
}
