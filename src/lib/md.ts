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

// ✅ Tell your app where to find each module's Markdown files
const CONTENT_DIRS = {
  upper: "upper-extremities-content",
  lower: "lower-extremities-content",
  pelvic: "pelvic-girdle-content",
  resources: "public/xposilearn/papers", // ✅ now points to your actual past paper folder
} as const;

export type ModuleKey = keyof typeof CONTENT_DIRS;

function contentDir(subdir: ModuleKey) {
  return path.join(root, CONTENT_DIRS[subdir]);
}

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

export async function listEntries(subdir: ModuleKey): Promise<EntryMeta[]> {
  const dir = contentDir(subdir);
  const files = readDirMarkdownFiles(dir);

  return files.map((absPath) => {
    const raw = fs.readFileSync(absPath, "utf8");
    const { data } = matter(raw);
    const slug = data.slug ?? path.basename(absPath).replace(/\.md$/, "");
    return {
      title: data.title ?? "",
      slug,
      description: data.description ?? "",
      image: data.image ?? "",
      region: data.region ?? "",
      projection: data.projection ?? "",
    } as EntryMeta;
  });
}

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
