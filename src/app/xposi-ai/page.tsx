import matter from "gray-matter";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { remark } from "remark";
import html from "remark-html";
import XPosiAIClient from "./XPosiAIClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** 📁 List all markdown files under /public/xposilearn/papers */
function listMdFiles() {
  const root = process.cwd();
  const baseDir = path.join(root, "public", "xposilearn", "papers");
  const years = ["year-1", "year-2", "year-3"];
  const results: { year: string; name: string; url: string }[] = [];

  for (const year of years) {
    const dir = path.join(baseDir, year);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    for (const f of files) {
      results.push({
        year,
        name: f.replace(/\.md$/, ""),
        url: `/xposi-ai?year=${year}&file=${encodeURIComponent(f)}`,
      });
    }
  }

  return results;
}

/** 🧠 Load and render a Markdown file as HTML */
async function loadMarkdown(year: string, file: string) {
  const root = process.cwd();
  const filePath = path.join(root, "public", "xposilearn", "papers", year, file);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { content } = matter(raw); // removes the --- frontmatter automatically
  const processed = await remark().use(html).process(content);
  return processed.toString();
}

export default async function XPosiAIPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; file?: string }>;
}) {
  // ✅ FIXED: unwrap searchParams first
  const { year, file } = await searchParams;
  const mdFiles = listMdFiles();

  // 🧭 If user clicked on a paper link
  if (year && file) {
    const htmlContent = await loadMarkdown(year, file);
    if (!htmlContent) notFound();

    return (
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <Link
        href="/xposi-ai"
        className="inline-block mb-6 text-sm text-blue-700 hover:underline"
        >
        ← Back to Papers
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-4">
          {file.replace(/\.md$/, "")}
        </h1>

        {/* ✅ Render Markdown content */}
        <article
          className="prose dark:prose-invert mb-10"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* ✅ AI assistant below */}
        <XPosiAIClient content={htmlContent} />
      </main>
    );
  }

  // 📚 Default: list of all Markdown files
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600 text-center mb-1">
        XPosi AI
      </h1>
    <p className="text-base sm:text-lg text-gray-500 text-center mb-10">
    Smart AI help for your past papers — learn faster, study smarter
    </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mdFiles.map((f) => (
          <a
            key={f.url}
            href={f.url}
            className="block p-5 rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-blue-700 font-semibold text-lg mb-1">{f.name}</h2>
            <p className="text-sm text-neutral-500">{f.year}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
