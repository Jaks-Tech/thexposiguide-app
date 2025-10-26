import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-center">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-blue-600 mb-3">
        The XPosiGuide
      </h1>

      <p className="text-neutral-700 text-base sm:text-lg max-w-2xl mx-auto mb-10">
        A structured guide to X-ray positioning and projection techniques for
        radiography students and professionals.
      </p>

      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-800 mb-6">
          Explore Modules
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Upper Extremities */}
          <Link
            href="/upper-extremities"
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md text-left"
          >
            <div className="relative w-full aspect-[4/3]">
              {/* Replace with /images/modules/upper.jpg when you have one */}
              <Image
                src="/assets/logo.png"
                alt="Upper Extremities"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority
              />
            </div>
            <div className="p-4">
              <h3 className="text-base sm:text-lg font-bold text-blue-700">
                Upper Extremities
              </h3>
              <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                Hand, wrist, forearm, elbow, humerus, shoulder: standardized positioning and projections.
              </p>
            </div>
          </Link>

          {/* Lower Extremities */}
          <Link
            href="/lower-extremities"
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md text-left"
          >
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/assets/logo.png"
                alt="Lower Extremities"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h3 className="text-base sm:text-lg font-bold text-blue-700">
                Lower Extremities
              </h3>
              <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                Foot, ankle, tibia/fibula, knee, femur: positioning references and evaluation criteria.
              </p>
            </div>
          </Link>

          {/* Pelvic Girdle */}
          <Link
            href="/pelvic-girdle"
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md text-left"
          >
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/assets/logo.png"
                alt="Pelvic Girdle"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h3 className="text-base sm:text-lg font-bold text-blue-700">
                Pelvic Girdle
              </h3>
              <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                Pelvis & hip projections: AP pelvis, hip, inlet/outlet, frog-leg views.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Page disclaimer (centered, separated by a line) */}
      <footer className="mt-12 border-t border-neutral-200 pt-6 pb-8 text-sm text-neutral-500 text-center px-4">
        <p className="max-w-2xl mx-auto">
          <strong>Disclaimer:</strong> Educational use only. Always follow institutional protocols and radiologist guidance.
        </p>
      </footer>
    </main>
  );
}
