import fs from "node:fs";
import path from "node:path";

type Subdir = "upper" | "lower" | "pelvic" | "resources";

/**
 * Checks if a relative public path exists.
 */
function existsPublic(relPath: string): boolean {
  const abs = path.join(process.cwd(), "public", relPath);
  return fs.existsSync(abs);
}

/**
 * Resolves an image URL for a given module and slug.
 * Tries multiple extensions, supports manual frontmatter images,
 * and gracefully falls back to a placeholder if nothing matches.
 */
export function resolveImageUrl(
  subdir: Subdir,
  slug: string,
  provided?: string
): string {
  // ✅ 1. If frontmatter path is absolute (starts with / or http)
  if (provided?.startsWith("/")) return provided;
  if (provided?.startsWith("http")) return provided;

  // ✅ 2. If frontmatter gives just a filename (e.g., "hand-pa.jpeg")
  if (provided) {
    const rel = `/illustrations/${subdir}/${provided}`;
    if (existsPublic(rel)) return rel;
  }

  // ✅ 3. Normalize slug (handle uppercase / spaces)
  const base = slug.trim().toLowerCase().replace(/\s+/g, "-");

  // ✅ 4. Try all common extensions
  const extensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];
  for (const ext of extensions) {
    const rel = `/illustrations/${subdir}/${base}${ext}`;
    if (existsPublic(rel)) return rel;
  }

  // ✅ 5. Try checking for "image" field name without slug (rare cases)
  if (existsPublic(`/illustrations/${subdir}/image.jpg`))
    return `/illustrations/${subdir}/image.jpg`;

  // ✅ 6. Fallback placeholder (check both new and legacy locations)
  if (existsPublic("/assets/placeholder.png")) return "/assets/placeholder.png";
  if (existsPublic("/images/placeholder.jpg")) return "/images/placeholder.jpg";

  // ✅ 7. Last resort (won’t crash even if missing)
  return `/illustrations/${subdir}/${base}.jpg`;
}
