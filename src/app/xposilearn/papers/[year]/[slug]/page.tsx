import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseServer";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import Image from "next/image";
import ReadAloud from "@/components/ReadAloud";
import AIAnswerBox from "@/app/xposilearn/papers/[year]/[slug]/AIAnswerBox";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PaperPage({ params }: { params: { year: string; slug: string } }) {
  const { year, slug } = params;

  const { data: entry, error } = await supabaseAdmin
    .from("uploads")
    .select("filename, path, description, image_url")
    .eq("category", "papers")
    .eq("year", year)
    .ilike("filename", `%${slug}%`)
    .single();

  if (error || !entry) {
    console.error("Paper not found:", error);
    notFound();
  }

  const { data: fileData, error: fileError } = await supabaseAdmin.storage
    .from("xposilearn")
    .download(entry.path);

  if (fileError || !fileData) {
    console.error("File download error:", fileError);
    notFound();
  }

  const text = await fileData.text();
  const { content, data: fm } = matter(text);
  const processed = await remark().use(html).process(content);
  const htmlContent = processed.toString();

  const title = fm.title || entry.filename.replace(/\.[^/.]+$/, "");
  const description = fm.description || entry.description || "X-ray past paper review and guidance.";

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">{title}</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">{description}</p>
      </header>

      {entry.image_url && (
        <div className="relative w-full aspect-[16/9] mb-8 overflow-hidden rounded-2xl shadow-md">
          <Image src={entry.image_url} alt={title} fill className="object-cover" priority />
        </div>
      )}

      <article className="prose dark:prose-invert max-w-none mb-10">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>

      <ReadAloud title={title} html={htmlContent} />
      <AIAnswerBox context={htmlContent} />

      <footer className="mt-12 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
        <p>
          <strong>Note:</strong> Educational use only — always confirm with institutional radiographic standards.
        </p>
      </footer>
    </main>
  );
}
