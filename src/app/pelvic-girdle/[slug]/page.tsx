import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseServer";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import Image from "next/image";
import ReadAloud from "@/components/ReadAloud";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const { data: entry, error } = await supabaseAdmin
    .from("uploads")
    .select("filename, description, image_url")
    .eq("module", "pelvic")
    .eq("category", "module")
    .ilike("filename", `%${slug}%`)
    .single();

  if (error || !entry) return { title: "Not Found" };

  const title = entry.filename.replace(/\.[^/.]+$/, "");
  const image = entry.image_url || "/assets/placeholder.png";
  const description =
    entry.description || "Pelvic Girdle X-ray positioning guide.";

  return {
    title: `${title} — Pelvic Girdle`,
    description,
    openGraph: { title, description, images: [{ url: image }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function PelvicEntryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const { data: entry, error } = await supabaseAdmin
    .from("uploads")
    .select("filename, path, description, image_url")
    .eq("module", "pelvic")
    .eq("category", "module")
    .ilike("filename", `%${slug}%`)
    .single();

  if (error || !entry) {
    console.error("❌ Pelvic entry not found:", error);
    notFound();
  }

  const { data: fileData, error: fileError } = await supabaseAdmin.storage
    .from("xposilearn")
    .download(entry.path);

  if (fileError || !fileData) {
    console.error("❌ File download error:", fileError);
    notFound();
  }

  const text = await fileData.text();
  const { content, data: fm } = matter(text);
  const processed = await remark().use(html).process(content);
  const htmlContent = processed.toString();

  const title = fm.title || entry.filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const description = fm.description || entry.description || "Pelvic Girdle X-ray positioning guide.";

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-600">{title}</h1>
        <p className="mt-2 text-gray-600">{description}</p>
      </header>

      {entry.image_url && (
        <div className="relative mb-6 overflow-hidden rounded-2xl">
          <Image
            src={entry.image_url}
            alt={title}
            width={1280}
            height={720}
            className="object-cover w-full h-auto rounded-2xl"
            priority
          />
        </div>
      )}

      <ReadAloud title={title} html={htmlContent} />

      <article className="prose dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>
    </main>
  );
}
