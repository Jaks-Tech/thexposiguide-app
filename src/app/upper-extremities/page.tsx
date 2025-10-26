import Image from "next/image";
import Link from "next/link";

export default async function UpperExtremitiesPage() {
  // Temporary sample items; replace with MD-driven data later
  const items = [
    {
      href: "#",
      title: "Hand — PA",
      meta: "Hand • PA",
      desc: "Seated PA hand with fingers separated; CR to 3rd MCP.",
    },
    {
      href: "#",
      title: "Wrist — PA",
      meta: "Wrist • PA",
      desc: "Pronate wrist on IR; CR to midcarpal area.",
    },
    {
      href: "#",
      title: "Elbow — AP",
      meta: "Elbow • AP",
      desc: "Extend elbow fully; CR perpendicular to elbow joint.",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-center">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-8">
        Upper Extremities
      </h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.title}
            href={it.href}
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md text-left"
          >
            <div className="relative w-full aspect-[4/3]">
              {/* Replace with relevant module image in /public/images/upper/... */}
              <Image
                src="/assets/logo.png"
                alt={it.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <div className="text-xs text-neutral-500">{it.meta}</div>
              <h3 className="mt-1 text-base font-semibold">{it.title}</h3>
              <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{it.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Module-specific disclaimer with separator line */}
      <footer className="mt-12 border-t border-neutral-200 pt-6 pb-8 text-sm text-neutral-500 text-center px-4 w-full">
        <p className="max-w-2xl mx-auto">
          <strong>Disclaimer:</strong> Educational use only. Always follow institutional protocols and radiologist directives.
        </p>
      </footer>
    </main>
  );
}
