import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseServer";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import Image from "next/image";
import ReadAloud from "@/components/ReadAloud";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** 🧠 Generate SEO metadata dynamically */
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Fetch by slug directly
  const { data: entry, error } = await supabaseAdmin
    .from("uploads")
    .select("filename, description, image_url")
    .eq("module", "upper")
    .eq("category", "module")
    .eq("slug", slug) // ✅ exact match using new slug column
    .single();

  if (error || !entry) return { title: "Not Found" };

  const title = entry.filename.replace(/\.[^/.]+$/, "");
  const image = entry.image_url || "/assets/placeholder.png";
  const description =
    entry.description || "Upper Extremities X-ray positioning guide.";

  return {
    title: `${title} — Upper Extremities`,
    description,
    openGraph: { title, description, images: [{ url: image }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

/** 🩻 Page component: render Markdown as HTML */
export default async function UpperEntryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // 1️⃣ Fetch file metadata from Supabase DB
  const { data: entry, error } = await supabaseAdmin
    .from("uploads")
    .select("filename, path, description, image_url")
    .eq("module", "upper")
    .eq("category", "module")
    .eq("slug", slug) // ✅ use exact slug
    .single();

  if (error || !entry) {
    console.error("❌ Upper entry not found:", error);
    notFound();
  }

  // 2️⃣ Download markdown file from Supabase Storage
  const { data: fileData, error: fileError } = await supabaseAdmin.storage
    .from("xposilearn")
    .download(entry.path);

  if (fileError || !fileData) {
    console.error("❌ File download error:", fileError);
    notFound();
  }

  // 3️⃣ Parse Markdown → HTML
  const text = await fileData.text();
  const { content, data: fm } = matter(text);
  const processed = await remark().use(html).process(content);
  const htmlContent = processed.toString();

  const title =
    fm.title ||
    entry.filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const description =
    fm.description || entry.description || "Upper Extremities X-ray positioning guide.";

  // 4️⃣ Render content
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-600">{title}</h1>
        <p className="mt-2 text-gray-600">{description}</p>
      </header>

      {/* Image (with fallback) */}
      <div className="relative mb-6 overflow-hidden rounded-2xl">
        <Image
          src={entry.image_url || "/assets/placeholder.png"}
          alt={title}
          width={1280}
          height={720}
          className="object-cover w-full h-auto rounded-2xl"
          priority
        />
      </div>

      {/* Read-aloud controls */}
      <ReadAloud title={title} html={htmlContent} />

      {/* Markdown content */}
      <article className="prose dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>
    </main>
  );
}
