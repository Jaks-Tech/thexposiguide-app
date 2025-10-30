import { notFound } from "next/navigation";
import { loadEntry } from "@/lib/md";
import { resolveImageUrl } from "@/lib/images";
import ReadAloud from "@/components/ReadAloud";
import AIAnswerBox from "./AIAnswerBox"; // ✅ your AI component
import Image from "next/image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { year: string; slug: string };

export default async function PaperPage({ params }: { params: Promise<Params> }) {
  const { year, slug } = await params;

  try {
    // Load markdown from resources folder
    const { meta, html } = await loadEntry("resources", slug);
    const hero = resolveImageUrl("resources", meta.slug, meta.image);

    return (
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* HEADER */}
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
            {meta.title}
          </h1>
          {meta.description && (
            <p className="text-neutral-600 max-w-2xl mx-auto">{meta.description}</p>
          )}
        </header>

        {/* HERO IMAGE */}
        {hero && (
          <div className="relative w-full aspect-[16/9] mb-8 overflow-hidden rounded-2xl shadow-md">
            <Image
              src={hero}
              alt={meta.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* MARKDOWN CONTENT */}
        <article className="prose dark:prose-invert max-w-none mb-10">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </article>

        {/* READ ALOUD */}
        <ReadAloud title={meta.title} html={html} />

        {/* AI ANSWER BOX */}
        <AIAnswerBox context={html} />

        {/* FOOTER */}
        <footer className="mt-12 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
          <p>
            <strong>Note:</strong> Educational use only — Always confirm with institutional radiographic standards.
          </p>
        </footer>
      </main>
    );
  } catch (error) {
    console.error("Error loading paper:", error);
    notFound();
  }
}
