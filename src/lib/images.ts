// src/lib/images.ts
type Subdir = "upper" | "lower" | "pelvic" | "resources";

/**
 * ✅ Builds a Supabase or relative URL for an entry image.
 * Never uses Node APIs (works in both server & client code).
 */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://bsxoefhogfwewjfrbmzv.supabase.co"; // ✅ your real Supabase project URL

export function resolveImageUrl(
  subdir: Subdir,
  slug: string,
  provided?: string
): string {
  // 1️⃣ Absolute URLs stay untouched
  if (provided?.startsWith("http")) return provided;
  if (provided?.startsWith("/")) return provided;

  // 2️⃣ Assume image stored in the Supabase bucket
  // (in xposilearn/modules/<subdir>/<slug>.jpg)
  const possible = `${SUPABASE_URL}/storage/v1/object/public/xposilearn/modules/${subdir}/${slug}.jpg`;

  // 3️⃣ Fallback placeholder
  return possible || "/assets/placeholder.png";
}
