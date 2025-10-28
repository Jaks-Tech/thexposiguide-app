"use client";

import Image from "next/image";
import { useState, useMemo } from "react";

type Props = {
  baseName: string; // e.g. "ap-foot-positioning"
  folder?: string;  // defaults to "/images/gallery"
  className?: string;
  alt?: string;
};

const EXT_TRY_ORDER = ["jpeg", "jpg", "png", "webp"];

export default function GalleryImage({
  baseName,
  folder = "/images/gallery",
  className = "",
  alt,
}: Props) {
  const [idx, setIdx] = useState(0);

  const trySrc = useMemo(
    () => `${folder}/${baseName}.${EXT_TRY_ORDER[Math.min(idx, EXT_TRY_ORDER.length - 1)]}`,
    [baseName, folder, idx]
  );

  return (
    <Image
      src={trySrc}
      alt={alt ?? baseName.replace(/-/g, " ")}
      fill
      className={className}
      onError={() => {
        // Try the next extension if this one 404s
        setIdx((i) => (i < EXT_TRY_ORDER.length - 1 ? i + 1 : i));
      }}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
      priority={false}
    />
  );
}
