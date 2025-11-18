import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseServer";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import Image from "next/image";
import ReadAloud from "@/components/ReadAloud";
import BackButton from "@/components/BackButton";
import ReturnToTop from "@/components/ReturnToTop";

// ✅ Import the external client wrapper (NO useState inside this file)
import PracticeQuizClientWrapper from "@/components/practice-mode/PracticeQuizClientWrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: entry, error } = await supabaseAdmin
    .from("uploads")
    .select("filename, description, image_url")
    .eq("module", "upper")
    .eq("category", "module")
    .eq("slug", slug)
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
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function UpperEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: entry, error } = await supabaseAdmin
    .from("uploads")
    .select("filename, path, description, image_url")
    .eq("module", "upper")
    .eq("category", "module")
    .eq("slug", slug)
    .single();

  if (error || !entry) {
    console.error("❌ Upper entry not found:", error);
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

  // Extract markdown frontmatter + content
  const { content, data: fm } = matter(text);

  // Convert markdown to HTML
  const processed = await remark().use(html).process(content);
  const htmlContent = processed.toString();

  const title =
    fm.title ||
    entry.filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const description =
    fm.description ||
    entry.description ||
    "Upper Extremities X-ray positioning guide.";

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-600">
          {title}
        </h1>
        <p className="mt-2 text-gray-600">{description}</p>
      </header>

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

      <ReturnToTop />

      <ReadAloud title={title} html={htmlContent} />

      <BackButton href="/upper-extremities" />

      <article className="prose dark:prose-invert mt-6">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>

      {/* =========================================== */}
      {/*         AI Practice Mode Integration        */}
      {/* =========================================== */}
      <PracticeQuizClientWrapper content={content} />
    </main>
  );
}
