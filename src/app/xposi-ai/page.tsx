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
  const { year, file } = await searchParams;
  const mdFiles = listMdFiles();

  /** 📖 If a user clicked on a paper link */
  if (year && file) {
    const htmlContent = await loadMarkdown(year, file);
    if (!htmlContent) notFound();

    return (
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        {/* 🧭 Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/xposi-ai"
            className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
          >
            ← Back to Papers
          </Link>
        </div>

        {/* 📘 Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-700 mb-2 tracking-tight">
            {file.replace(/\.md$/, "").replace(/[-_]/g, " ").toUpperCase()}
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto text-base">
            AI-powered explanations and insights for radiography past papers.
          </p>
          <div className="h-1 w-20 bg-blue-500 mx-auto mt-3 rounded-full"></div>
        </header>

        {/* 📄 Paper Content */}
        <section className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 mb-10 transition hover:shadow-md">
          <article
            className="prose prose-blue max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </section>

        {/* 🤖 AI Assistant */}
        <section className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2 mb-3">
            🤖 Ask <span className="font-extrabold text-blue-800">XPosi AI</span>
          </h2>
          <p className="text-sm text-neutral-600 mb-5">
            Generate AI-based guidance, explanations, or study help for this paper.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <XPosiAIClient content={htmlContent} />
          </div>

          <div className="mt-6 text-xs text-neutral-500 border-t border-blue-100 pt-3">
            <p>
              <strong>Note:</strong> This AI assistant is designed for educational support.
              Always confirm details with standard radiography references.
            </p>
          </div>
        </section>
      </main>
    );
  }

  /** 🧾 Default: list of available past papers */
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 text-center mb-2">
        XPosi AI
      </h1>
      <p className="text-base sm:text-lg text-gray-500 text-center mb-12">
        Smart AI assistance for your past papers — learn faster, study smarter.
      </p>

      {/* 📚 Paper Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {mdFiles.map((f) => (
          <a
            key={f.url}
            href={f.url}
            className="block p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
          >
            <h2 className="text-blue-700 font-bold text-lg mb-2">
              {f.name.replace(/[-_]/g, " ").toUpperCase()}
            </h2>
            <p className="text-sm text-neutral-500">{f.year.replace("-", " ")}</p>
          </a>
        ))}
      </div>

      {/* ✨ Footer */}
      <footer className="mt-16 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
        <p>
          <strong>XPosi AI</strong> © {new Date().getFullYear()} — Educational use only.
          Always follow institutional and radiographic best practices.
        </p>
      </footer>
    </main>
  );
}
