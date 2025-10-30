import Link from "next/link";
import Image from "next/image";
import GalleryImage from "@/components/GalleryImage";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 text-center">
      {/* HERO */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-600 mb-3">
        The XPosiGuide
      </h1>

      <p className="text-neutral-700 text-base sm:text-lg max-w-2xl mx-auto">
        A structured guide to X-ray positioning and projection techniques for
        radiography students and professionals.
      </p>

      {/* Running tagline */}
      <div className="mt-5 overflow-hidden">
        <div className="inline-block whitespace-nowrap text-blue-600/90 font-semibold text-base sm:text-lg animate-marquee">
          Position right • Expose smart • Diagnose clearly
        </div>
      </div>

      {/* INTRO VIDEO */}
      <section className="mt-10 sm:mt-12 mb-12 sm:mb-14 flex justify-center">
        <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5 bg-black">
          <video
            className="w-full h-full object-cover"
            controls
            preload="metadata"
            poster="/assets/XPosiGuide-Intro-thumb.jpg.png"
          >
            <source src="/assets/XPosiGuide-Intro.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* MODULE CARDS */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-800 mb-6">
          Explore Modules
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Upper Extremities */}
          <Link
            href="/upper-extremities"
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md text-left"
          >
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/assets/upper-extremities.png"
                alt="Upper Extremities"
                fill
                className="object-contain p-6"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority
              />
            </div>
            <div className="p-4">
              <h3 className="text-base sm:text-lg font-bold text-blue-700">
                Upper Extremities
              </h3>
              <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                Hand, wrist, forearm, elbow, humerus, shoulder: standardized
                positioning and projections.
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
                src="/assets/lower-extremities.png"
                alt="Lower Extremities"
                fill
                className="object-contain p-6"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
            <div className="p-4">
              <h3 className="text-base sm:text-lg font-bold text-blue-700">
                Lower Extremities
              </h3>
              <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                Foot, ankle, tibia/fibula, knee, femur: positioning references
                and evaluation criteria.
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
                src="/assets/pelvic_girdle.png"
                alt="Pelvic Girdle"
                fill
                className="object-contain p-6"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
            <div className="p-4">
              <h3 className="text-base sm:text-lg font-bold text-blue-700">
                Pelvic Girdle
              </h3>
              <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                Pelvis & hip projections: AP pelvis, inlet/outlet, frog-leg
                views.
              </p>
            </div>
          </Link>

          {/* XPosiLearn */}
          <Link
            href="/xposilearn"
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md text-left"
          >
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/assets/xposilearn.png" // Add this thumbnail in /public/assets/
                alt="XPosiLearn"
                fill
                className="object-contain p-6"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
            <div className="p-4">
              <h3 className="text-base sm:text-lg font-bold text-blue-700">
                XPosiLearn
              </h3>
              <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                Study & revision hub with Notes, Past Papers, and reference materials for all levels.
              </p>
            </div>
          </Link>
          {/* XPosi AI */}
          <Link
            href="/xposi-ai"
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md text-left"
          >
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/assets/xposi-ai.png" // 📸 you’ll add this image next
                alt="XPosi AI"
                fill
                className="object-contain p-6"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h3 className="text-base sm:text-lg font-bold text-blue-700">
                XPosi AI
              </h3>
              <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                Intelligent radiography assistant that reads and explains past papers.
              </p>
            </div>
          </Link>

        </div>
      </section>

      {/* WHY SECTION */}
      <section className="mt-14 sm:mt-16">
        <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 mb-6">
          Why The XPosiGuide?
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {[
            {
              title: "Visual Learning",
              desc: "Image-rich modules that make radiographic positioning intuitive.",
              emoji: "🎨",
            },
            {
              title: "Precision Focused",
              desc: "Every entry emphasizes correct angles, alignment, and beam centering.",
              emoji: "🎯",
            },
            {
              title: "Repo-Driven Content",
              desc: "Drop new Markdown files in your folders — deploy to update content.",
              emoji: "⚡",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl bg-white border border-neutral-200 p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-semibold text-neutral-800">{f.title}</h3>
              <p className="text-neutral-600 text-sm mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* IMAGE GALLERY */}
      <section className="mt-14 sm:mt-16">
        <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 mb-6">
          Glimpse into Practice
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "cervical-spin-ap-positioning",
              title: "Cervical Spine — AP Positioning",
              desc: "Demonstrates patient positioning for anterior–posterior cervical spine projection.",
            },
            {
              name: "lat-knee-positioning",
              title: "Lateral Knee Positioning",
              desc: "Shows proper lateral positioning of the knee with detector placement for side projection.",
            },
            {
              name: "ap-foot-positioning",
              title: "AP Foot Projection Setup",
              desc: "Illustrates the AP view for the foot with central ray directed to the base of the 3rd metatarsal.",
            },
            {
              name: "pa-hand-positioning",
              title: "PA Hand Projection",
              desc: "Displays standard PA hand positioning for phalanges and metacarpal visualization.",
            },
            {
              name: "radiographic-positions",
              title: "Radiographic Positions Overview",
              desc: "Summarized positioning techniques for various skeletal regions in radiography.",
            },
            {
              name: "x-ray-set-up",
              title: "X-Ray Equipment Setup",
              desc: "Depicts alignment between tube, detector, and patient for optimal beam geometry.",
            },
            {
              name: "chest-x-ray-pa",
              title: "Chest X-Ray — PA",
              desc: "Posterior–anterior projection technique for chest radiography, reducing heart magnification.",
            },
          ].map((img) => (
            <div
              key={img.name}
              className="overflow-hidden rounded-xl ring-1 ring-black/5 shadow-sm hover:shadow-md transition bg-white"
            >
              <div className="relative aspect-[4/3]">
                <GalleryImage
                  baseName={img.name}
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 text-left">
                <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-1">
                  {img.title}
                </h3>
                <p className="text-sm text-neutral-600">{img.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
          {/* ✉️ Newsletter Section */}
          <section className="relative mt-20 mb-16 px-4 animate-fadeInUp">
            <div className="relative max-w-3xl mx-auto overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white p-10 sm:p-14 transition-transform hover:scale-[1.01]">
              {/* Decorative overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm" />
          
              <div className="relative z-10 text-center">
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight">
                  Subscribe to <span className="text-white/90">The XPosiGuide</span> Newsletter
                </h2>
                <p className="text-white/80 text-sm sm:text-base mb-6 max-w-xl mx-auto">
                  Join our growing community of radiography learners!  
                  Get updates on new modules, study resources, and AI-powered learning tools delivered to your inbox.
                </p>
          
                {/* ✅ MailerLite Embed */}
                <div className="ml-embedded" data-form="R6RPfh"></div>
          
                {/* 🎉 Success message (hidden by default) */}
                <div
                  id="successMessage"
                  className="hidden mt-6 bg-white/10 text-white rounded-lg px-4 py-3 text-sm sm:text-base font-medium shadow-md backdrop-blur-md"
                >
                  🎉 Thanks for joining <span className="font-semibold">The XPosiGuide</span> community!
                </div>
              </div>
            </div>
          </section>

      {/* FOOTER DISCLAIMER */}
      <footer className="mt-14 border-t border-neutral-200 pt-6 pb-8 text-sm text-neutral-500 text-center px-4">
        <p className="max-w-2xl mx-auto">
          <strong>Disclaimer:</strong> Educational use only. Always follow
          institutional protocols and radiologist guidance.
        </p>
      </footer>
    </main>
  );
}
