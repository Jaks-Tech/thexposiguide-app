import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseServer";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import Image from "next/image";
import ReadAloud from "@/components/ReadAloud";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ✅ Generate social + SEO metadata dynamically
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Fetch from DB
  const { data: entry, error } = await supabaseAdmin
    .from("uploads")
    .select("filename, description, image_url")
    .eq("module", "upper")
    .eq("category", "module")
    .ilike("filename", `%${slug}%`)
    .single();

  if (error || !entry) {
    return { title: "Not Found" };
  }

  const title = entry.filename.replace(/\.[^/.]+$/, "");
  const image = entry.image_url || "/assets/logo.png";
  const description = entry.description || "Upper Extremities X-ray positioning guide.";

  return {
    title: `${title} — Upper Extremities`,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// ✅ Main page component
export default async function UpperEntryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // 1️⃣ Get file metadata from Supabase DB
  const { data: entry, error: entryError } = await supabaseAdmin
    .from("uploads")
    .select("filename, path, description, image_url")
    .eq("module", "upper")
    .eq("category", "module")
    .ilike("filename", `%${slug}%`)
    .single();

  if (entryError || !entry) {
    console.error("Entry not found:", entryError);
    notFound();
  }

  // 2️⃣ Download markdown content
  const { data: fileData, error: fileError } = await supabaseAdmin.storage
    .from("xposilearn")
    .download(entry.path);

  if (fileError || !fileData) {
    console.error("File download error:", fileError);
    notFound();
  }

  // 3️⃣ Parse markdown
  const text = await fileData.text();
  const { content, data: frontmatter } = matter(text);
  const processed = await remark().use(html).process(content);
  const htmlContent = processed.toString();

  const title =
    frontmatter.title ||
    entry.filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const description =
    frontmatter.description || entry.description || "Upper Extremities X-ray positioning guide.";

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-blue-600">
          {title}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{description}</p>
      </header>

      {/* ✅ Hero image */}
      {entry.image_url && (
        <div className="relative mb-6 overflow-hidden rounded-2xl">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={entry.image_url}
              alt={title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* 🗣️ Read-aloud */}
      <ReadAloud title={title} html={htmlContent} />

      {/* 📝 Markdown content */}
      <article className="prose dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>
    </main>
  );
}
