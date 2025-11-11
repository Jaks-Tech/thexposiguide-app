// src/lib/md.ts
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { supabaseAdmin } from "@/lib/supabaseServer";

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
 * 📋 Lists all markdown entries from Supabase Storage + uploads table.
 * Reads metadata from the 'uploads' table.
 */
export async function listEntries(subdir: ModuleKey): Promise<EntryMeta[]> {
  const { data, error } = await supabaseAdmin
    .from("uploads")
    .select("filename, url, image_url")
    .eq("category", "module")
    .eq("module", subdir)
    .order("filename", { ascending: true });

  if (error) {
    console.error("Supabase listEntries error:", error.message);
    return [];
  }

  return (
    data?.map((row) => {
      const slug = row.filename.replace(/\.md$/, "");
      return {
        title: slug.replace(/[-_]/g, " "),
        slug,
        description: "",
        image: row.image_url || "",
        url: row.url,
      } as EntryMeta;
    }) ?? []
  );
}

/**
 * 🧠 Loads a single markdown file by slug from Supabase Storage.
 * Converts it into HTML using remark.
 */
export async function loadEntry(subdir: ModuleKey, slug: string) {
  const { data, error } = await supabaseAdmin
    .from("uploads")
    .select("url")
    .eq("category", "module")
    .eq("module", subdir)
    .ilike("filename", `${slug}.md`)
    .single();

  if (error || !data) throw new Error(`Markdown not found for slug: ${slug}`);

  const res = await fetch(data.url);
  const raw = await res.text();
  const parsed = matter(raw);
  const processed = await remark().use(html).process(parsed.content);

  return {
    meta: {
      title: parsed.data.title ?? slug,
      slug,
      description: parsed.data.description ?? "",
      image: parsed.data.image ?? "",
      region: parsed.data.region ?? "",
      projection: parsed.data.projection ?? "",
      url: data.url,
    } as EntryMeta,
    html: processed.toString(),
  };
}
