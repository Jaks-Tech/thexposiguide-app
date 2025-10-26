import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-10 text-center">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-3">
        The XPosiGuide
      </h1>

      <p className="text-neutral-700 text-lg max-w-2xl mb-10">
        A structured guide to X-ray positioning and projection techniques for
        radiography students and professionals.
      </p>

      <section className="w-full max-w-3xl">
        <h2 className="text-2xl font-semibold text-neutral-800 mb-6">
          Explore Modules
        </h2>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 place-items-center">
          <Link
            href="/upper-extremities"
            className="block border border-neutral-200 rounded-lg p-6 hover:bg-blue-50 transition w-full max-w-xs"
          >
            <h3 className="text-xl font-bold text-blue-700">
              Upper Extremities
            </h3>
            <p className="text-neutral-600 text-sm mt-2">
              Covers radiographic positioning for the hand, wrist, forearm,
              elbow, humerus, and shoulder.
            </p>
          </Link>

          <Link
            href="/lower-extremities"
            className="block border border-neutral-200 rounded-lg p-6 hover:bg-blue-50 transition w-full max-w-xs"
          >
            <h3 className="text-xl font-bold text-blue-700">
              Lower Extremities
            </h3>
            <p className="text-neutral-600 text-sm mt-2">
              Includes positioning for the foot, ankle, tibia/fibula, knee,
              and femur projections.
            </p>
          </Link>

          <Link
            href="/pelvic-girdle"
            className="block border border-neutral-200 rounded-lg p-6 hover:bg-blue-50 transition w-full max-w-xs"
          >
            <h3 className="text-xl font-bold text-blue-700">Pelvic Girdle</h3>
            <p className="text-neutral-600 text-sm mt-2">
              Focused on pelvis and hip projections — AP, inlet/outlet, and
              frog-leg views.
            </p>
          </Link>
        </div>
      </section>

      <footer className="mt-12 border-t border-neutral-200 pt-6 pb-6 text-sm text-neutral-500 text-center w-full">
        <p className="max-w-2xl mx-auto px-4">
          <strong>Disclaimer:</strong> This resource is for educational use
          only. Always follow institutional protocols and radiologist guidance.
        </p>
      </footer>
    </main>
  );
}
