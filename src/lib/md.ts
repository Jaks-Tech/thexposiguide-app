// src/lib/md.ts
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { supabase } from "@/lib/supabaseClient"; // 🔥 FIXED (no more fetch failed)

export type EntryMeta = {
  title: string;
  slug: string;
  description: string;
  image?: string;
  region?: string;
  projection?: string;
  url?: string;
};

export type ModuleKey = "upper" | "lower" | "pelvic";

/**
 * 📋 Lists all markdown entries from Supabase uploads table.
 */
export async function listEntries(subdir: ModuleKey): Promise<EntryMeta[]> {
  const { data, error } = await supabase
    .from("uploads")
    .select("filename, file_url, image_url")
    .eq("category", "module")
    .eq("module", subdir)
    .order("filename", { ascending: true });

  if (error) {
    console.error("Supabase listEntries error:", error.message);
    return [];
  }

  return (
    data?.map((row) => {
      const slug = row.filename.replace(/\.[^/.]+$/, "");
      return {
        title: slug.replace(/[-_]/g, " "),
        slug,
        description: "",
        image: row.image_url || "",
        url: row.file_url,
      } as EntryMeta;
    }) ?? []
  );
}

/**
 * 🧠 Loads a single markdown file (case-insensitive flexible match)
 */
export async function loadEntry(subdir: ModuleKey, slug: string) {
  const { data: rows, error } = await supabase
    .from("uploads")
    .select("filename, file_url, image_url, description")
    .eq("category", "module")
    .eq("module", subdir);

  if (error || !rows) {
    console.error("❌ Failed to load uploads:", error);
    return null;
  }

  // Match slug to filename safely
  const entry = rows.find((item) => {
    const fileSlug = item.filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_ ]+/g, "-")
      .toLowerCase();
    return fileSlug === slug.toLowerCase();
  });

  if (!entry) {
    console.error("❌ Entry not found for slug:", slug);
    return null;
  }

  // Download MD file
  const res = await fetch(entry.file_url);
  if (!res.ok) {
    console.error("❌ Failed to fetch markdown:", entry.file_url);
    return null;
  }

  const raw = await res.text();
  const parsed = matter(raw);
  const processed = await remark().use(html).process(parsed.content);

  return {
    meta: {
      title: parsed.data.title ?? slug,
      slug,
      description: parsed.data.description ?? entry.description ?? "",
      image: parsed.data.image ?? entry.image_url ?? "",
      region: parsed.data.region ?? "",
      projection: parsed.data.projection ?? "",
      url: entry.file_url,
    },
    html: processed.toString(),
  };
}

/**
 * ✂️ Extracts preview, cleans bullets, strips markdown
 */
export async function loadEntryPreview(
  subdir: ModuleKey,
  slug: string,
  maxChars: number = 300
): Promise<string> {
  const { data: rows, error } = await supabase
    .from("uploads")
    .select("filename, file_url")
    .eq("category", "module")
    .eq("module", subdir);

  if (error || !rows) {
    console.error("❌ Preview query error:", error);
    return "";
  }

  const entry = rows.find((item) => {
    const fileSlug = item.filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_ ]+/g, "-")
      .toLowerCase();
    return fileSlug === slug.toLowerCase();
  });

  if (!entry) return "";

  const res = await fetch(entry.file_url);
  if (!res.ok) return "";

  const raw = await res.text();
  const parsed = matter(raw);
  let content = parsed.content || "";

  if (!content) return "";

  // Remove headings (#)
  content = content.replace(/#+\s*/g, "");

  // Remove bold/italic
  content = content.replace(/(\*{1,2}|_{1,2})(.*?)\1/g, "$2");

  // Bullet → sentence
  content = content.replace(/^\s*[-*+]\s+(.*)$/gm, "$1. ");
  content = content.replace(/^\s*\d+\.\s+(.*)$/gm, "$1. ");

  // Remove inline code
  content = content.replace(/`([^`]+)`/g, "$1");

  // Convert links [text](url) → text
  content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Remove blockquotes
  content = content.replace(/^>\s+/gm, "");

  // Collapse whitespace
  content = content.replace(/\s+/g, " ").trim();

  // Trim to preview length
  if (content.length <= maxChars) return content;

  const sliced = content.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced) + " ...";
}
