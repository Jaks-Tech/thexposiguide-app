import ReadAloud from "@/components/ReadAloud";
import Image from "next/image";
import { notFound } from "next/navigation";
import { loadEntry } from "@/lib/md";
import { resolveImageUrl } from "@/lib/images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { slug: string };

// NOTE: params is a Promise; await it here
export async function generateMetadata({ params }: { params: Promise<Params> }) {
  try {
    const { slug } = await params;
    const { meta } = await loadEntry("upper", slug);
    const img = resolveImageUrl("upper", meta.slug, meta.image);
    return {
      title: `${meta.title} — Upper Extremities`,
      description: meta.description,
      openGraph: {
        title: meta.title,
        description: meta.description,
        images: img ? [{ url: img }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: meta.title,
        description: meta.description,
        images: img ? [img] : [],
      },
    };
  } catch {
    return { title: "Not found" };
  }
}

// NOTE: params is a Promise; await it here too
export default async function UpperEntryPage({ params }: { params: Promise<Params> }) {
  try {
    const { slug } = await params;
    const { meta, html } = await loadEntry("upper", slug);
    const hero = resolveImageUrl("upper", meta.slug, meta.image);

    return (
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-blue-600">
            {meta.title}
          </h1>
          {(meta.region || meta.projection) && (
            <div className="mt-2 flex flex-wrap justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              {meta.region && (
                <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
                  {meta.region}
                </span>
              )}
              {meta.projection && (
                <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
                  {meta.projection}
                </span>
              )}
            </div>
          )}
        </header>

        {hero && (
          <div className="relative mb-6 overflow-hidden rounded-2xl">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={hero}
                alt={meta.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* 🗣️ Read-aloud controls (voice over for this entry) */}
        <ReadAloud title={meta.title} html={html} />

        <article className="prose dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </main>
    );
  } catch {
    notFound();
  }
}
