import Link from "next/link";
import Image from "next/image";
import type { EntryMeta } from "@/lib/md";
import { resolveImageUrl } from "@/lib/images";

type ModuleKey = "upper" | "lower" | "pelvic";

type Props = {
  href: string;
  entry: EntryMeta;
  subdir: ModuleKey;
};

export default function EntryCard({ href, entry, subdir }: Props) {
  // ✅ Try to resolve the provided image or auto-detect from folder
  const img = resolveImageUrl(subdir, entry.slug, entry.image);

  // ✅ Fallback image in case URL is missing or fails to load
  const fallbackImage = "https://placehold.co/600x400?text=No+Image";

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-blue-200 via-sky-100 to-blue-300 p-[1px] shadow-md hover:shadow-lg transition"
    >
      <div className="rounded-2xl bg-white">
        {/* Image section */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl">
          <Image
            src={img || fallbackImage}
            alt={entry.title || "Module image"}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // @ts-ignore – safely replace image source on failure
              e.currentTarget.src = fallbackImage;
            }}
          />
        </div>

        {/* Text section */}
        <div className="p-4 sm:p-5">
          <h3 className="text-lg font-semibold tracking-tight text-gray-900 group-hover:text-blue-600">
            {entry.title}
          </h3>

          {(entry.region || entry.projection) && (
            <p className="mt-1 text-sm text-gray-500">
              {entry.region ? `${entry.region}` : ""}
              {entry.region && entry.projection ? " · " : ""}
              {entry.projection ? `${entry.projection}` : ""}
            </p>
          )}

          {entry.description && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
              {entry.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
