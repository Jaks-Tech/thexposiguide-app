import Image from "next/image";
import Link from "next/link";

export default async function LowerExtremitiesPage() {
  const items = [
    {
      href: "#",
      title: "Foot — AP",
      meta: "Foot • AP",
      desc: "CR angled 10° posteriorly to base of 3rd metatarsal.",
    },
    {
      href: "#",
      title: "Ankle — Mortise",
      meta: "Ankle • Oblique (Mortise)",
      desc: "Internally rotate leg 15–20°; open mortise joint.",
    },
    {
      href: "#",
      title: "Knee — AP",
      meta: "Knee • AP",
      desc: "CR parallel to tibial plateau; include distal femur/proximal tib-fib.",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-center">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-8">
        Lower Extremities
      </h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.title}
            href={it.href}
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md text-left"
          >
            <div className="relative w-full aspect-[4/3]">
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

      <footer className="mt-12 border-t border-neutral-200 pt-6 pb-8 text-sm text-neutral-500 text-center px-4 w-full">
        <p className="max-w-2xl mx-auto">
          <strong>Disclaimer:</strong> Educational use only. Always follow institutional protocols and radiologist directives.
        </p>
      </footer>
    </main>
  );
}
