import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type EntryMeta = {
  title: string;
  slug: string;
  description: string;
  image?: string;
  region?: string;
  projection?: string;
};

const root = process.cwd();

/**
 * ✅ Updated: Tell the app where each module’s Markdown files now live.
 * Moved to the new structure under public/xposilearn/modules/
 */
const CONTENT_DIRS = {
  upper: "public/xposilearn/modules/upper",
  lower: "public/xposilearn/modules/lower",
  pelvic: "public/xposilearn/modules/pelvic",
  resources: "public/xposilearn/papers", // for past papers
} as const;

export type ModuleKey = keyof typeof CONTENT_DIRS;

function contentDir(subdir: ModuleKey) {
  return path.join(root, CONTENT_DIRS[subdir]);
}

/** Recursively read all .md files from a directory */
function readDirMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return readDirMarkdownFiles(fullPath);
      }
      return entry.name.toLowerCase().endsWith(".md") ? [fullPath] : [];
    });
}

/** 🧩 List all markdown entries for a given module */
export async function listEntries(subdir: ModuleKey): Promise<EntryMeta[]> {
  const dir = contentDir(subdir);
  const files = readDirMarkdownFiles(dir);

  return files.map((absPath) => {
    const raw = fs.readFileSync(absPath, "utf8");
    const { data } = matter(raw);
    const slug = data.slug ?? path.basename(absPath).replace(/\.md$/, "");
    return {
      title: data.title ?? slug,
      slug,
      description: data.description ?? "",
      image: data.image ?? "",
      region: data.region ?? "",
      projection: data.projection ?? "",
    } as EntryMeta;
  });
}

/** 🧠 Load a single markdown entry by slug */
export async function loadEntry(subdir: ModuleKey, slug: string) {
  const dir = contentDir(subdir);
  const files = readDirMarkdownFiles(dir);

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    const fmSlug = parsed.data.slug ?? path.basename(filePath).replace(/\.md$/, "");

    if (fmSlug === slug) {
      const processed = await remark().use(html).process(parsed.content);
      return {
        meta: {
          title: parsed.data.title ?? "",
          slug: fmSlug,
          description: parsed.data.description ?? "",
          image: parsed.data.image ?? "",
          region: parsed.data.region ?? "",
          projection: parsed.data.projection ?? "",
        } as EntryMeta,
        html: processed.toString(),
      };
    }
  }

  throw new Error(`Markdown not found for slug: ${slug}`);
}
