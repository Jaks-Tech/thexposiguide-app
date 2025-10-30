import fs from "node:fs";
import path from "node:path";

type Subdir = "upper" | "lower" | "pelvic" | "resources"; // ✅ include "resources"
function existsPublic(relPath: string) {
  const abs = path.join(process.cwd(), "public", relPath);
  return fs.existsSync(abs);
}

export function resolveImageUrl(
  subdir: Subdir,
  slug: string,
  provided?: string
): string {
  // 1) If frontmatter image starts with "/", use as-is.
  if (provided?.startsWith("/")) return provided;

  // 2) If frontmatter is a filename (e.g., hand-pa.jpeg), look in /illustrations/<subdir>/
  if (provided) {
    const rel = `/illustrations/${subdir}/${provided}`;
    if (existsPublic(rel)) return rel;
  }

  // 3) Try common extensions by slug
  const exts = [".jpg", ".jpeg", ".png", ".webp"];
  for (const ext of exts) {
    const rel = `/illustrations/${subdir}/${slug}${ext}`;
    if (existsPublic(rel)) return rel;
  }

  // 4) Fallback placeholder if present
  if (existsPublic("/images/placeholder.jpg")) return "/images/placeholder.jpg";

  // Last resort: keep default jpg path (may 404 if missing)
  return `/illustrations/${subdir}/${slug}.jpg`;
}
