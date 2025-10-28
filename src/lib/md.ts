import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type EntryMeta = {
  title: string;
  slug: string;
  description: string;
  image?: string;     // filename (e.g. hand-pa.jpg) OR absolute path (/illustrations/upper/hand-pa.jpg)
  region?: string;
  projection?: string;
};

const root = process.cwd();

/**
 * Map each module key to the repo folders that hold Markdown.
 * You will drop .md files into these folders:
 * - /upper-extremities-content
 * - /lower-extremities-content
 * - /pelvic-girdle-content
 */
const CONTENT_DIRS = {
  upper: "upper-extremities-content",
  lower: "lower-extremities-content",
  pelvic: "pelvic-girdle-content",
} as const;

export type ModuleKey = keyof typeof CONTENT_DIRS; // "upper" | "lower" | "pelvic"

function contentDir(subdir: ModuleKey) {
  return path.join(root, CONTENT_DIRS[subdir]);
}

function readDirMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  // Case-insensitive .md
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".md"))
    .map((f) => path.join(dir, f));
}

function deriveSlug(filePath: string, dataSlug: unknown): string {
  if (typeof dataSlug === "string" && dataSlug.trim().length > 0) {
    return dataSlug.trim();
  }
  const base = path.basename(filePath);
  return base.replace(/\.md$/i, "");
}

/**
 * Return all entries (frontmatter only) from a module’s folder.
 * Slug preference: frontmatter.slug -> filename (minus .md)
 */
export async function listEntries(subdir: ModuleKey): Promise<EntryMeta[]> {
  const dir = contentDir(subdir);
  const files = readDirMarkdownFiles(dir);

  return files.map((absPath) => {
    const raw = fs.readFileSync(absPath, "utf8");
    const { data } = matter(raw);
    const slug = deriveSlug(absPath, data.slug);

    return {
      title: (data.title ?? "").toString(),
      slug,
      description: (data.description ?? "").toString(),
      image: data.image ? data.image.toString() : "",
      region: data.region ? data.region.toString() : "",
      projection: data.projection ? data.projection.toString() : "",
    } as EntryMeta;
  });
}

/**
 * Load one entry by slug, convert Markdown → HTML, and return meta + html.
 * 1) tries <slug>.md
 * 2) scans files for matching frontmatter.slug
 */
export async function loadEntry(
  subdir: ModuleKey,
  slugRaw: string
): Promise<{ meta: EntryMeta; html: string }> {
  const dir = contentDir(subdir);
  const slug = slugRaw.trim();

  // 1) Direct file match: <slug>.md
  const directFile = path.join(dir, `${slug}.md`);
  if (fs.existsSync(directFile)) {
    const raw = fs.readFileSync(directFile, "utf8");
    const { data, content } = matter(raw);
    const processed = await remark().use(html).process(content);
    const htmlStr = processed.toString();

    const meta: EntryMeta = {
      title: (data.title ?? "").toString(),
      slug: deriveSlug(directFile, data.slug), // ensure canonical
      description: (data.description ?? "").toString(),
      image: data.image ? data.image.toString() : "",
      region: data.region ? data.region.toString() : "",
      projection: data.projection ? data.projection.toString() : "",
    };

    return { meta, html: htmlStr };
  }

  // 2) Fallback: iterate files to find matching frontmatter.slug
  const files = readDirMarkdownFiles(dir);
  for (const abs of files) {
    const raw = fs.readFileSync(abs, "utf8");
    const parsed = matter(raw);
    const fmSlug = deriveSlug(abs, parsed.data.slug);

    if (fmSlug === slug) {
      const processed = await remark().use(html).process(parsed.content);
      const htmlStr = processed.toString();

      const meta: EntryMeta = {
        title: (parsed.data.title ?? "").toString(),
        slug: fmSlug,
        description: (parsed.data.description ?? "").toString(),
        image: parsed.data.image ? parsed.data.image.toString() : "",
        region: parsed.data.region ? parsed.data.region.toString() : "",
        projection: parsed.data.projection ? parsed.data.projection.toString() : "",
      };

      return { meta, html: htmlStr };
    }
  }

  // Helpful dev log
  console.warn(
    `[md] No match for slug="${slug}" in ${dir}. Files seen: ${files
      .map((p) => path.basename(p))
      .join(", ")}`
  );
  throw new Error("Not found");
}

/**
 * List slugs for static generation or other needs.
 * Uses frontmatter.slug when present; otherwise filename.
 */
export async function listSlugs(subdir: ModuleKey): Promise<string[]> {
  const entries = await listEntries(subdir);
  return entries.map((e) => e.slug);
}
