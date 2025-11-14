"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import GalleryImage from "@/components/GalleryImage";
import AnnouncementsWidget from "@/components/AnnouncementsWidget";
import ReturnToTop from "@/components/ReturnToTop";
import ProTips from "@/components/ProTips";

export default function HomePage() {
  const heroBgRef = useRef<HTMLDivElement | null>(null);

  // ✨ Fade-up animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("animate-fadeUp");
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }, []);

  // 🌌 Parallax background for hero
  useEffect(() => {
    const handleScroll = () => {
      if (!heroBgRef.current) return;
      const offset = window.scrollY;
      heroBgRef.current.style.transform = `translateY(${offset * 0.08}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🎮 3D tilt effect for module cards
  const handleTiltMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotateX = ((y - midY) / midY) * 6; // max tilt
    const rotateY = ((x - midX) / midX) * -6;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const handleTiltLeave = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const card = event.currentTarget;
    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
  };

  return (
    <main
      className="
        mx-auto w-full 
        max-w-[1700px] 
        px-6 lg:px-12 
        py-10 sm:py-12 
        text-center
      "
    >
      {/* 🎨 Custom animation + FX styles */}
      <style>
        {`
          @keyframes fadeUp {
            0% { opacity: 0; transform: translateY(25px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeUp {
            animation: fadeUp 0.9s ease-out forwards;
          }

          @keyframes float {
            0% { transform: translateY(0px); opacity: 0.5; }
            50% { transform: translateY(-12px); opacity: 1; }
            100% { transform: translateY(0px); opacity: 0.5; }
          }

          @keyframes floatSlow {
            0% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-10px) translateX(8px); }
            100% { transform: translateY(0px) translateX(0px); }
          }

          @keyframes sparkle {
            0% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 0.9; transform: scale(1); }
            100% { opacity: 0.3; transform: scale(0.9); }
          }

          .floating-shape {
            animation: float 6s ease-in-out infinite;
          }

          .floating-card {
            animation: floatSlow 10s ease-in-out infinite;
          }

          .spark {
            position: absolute;
            border-radius: 9999px;
            background: radial-gradient(circle, rgba(37,99,235,0.9), transparent);
            animation: sparkle 4s ease-in-out infinite alternate;
          }
        `}
      </style>
 
      {/* ⭐ HERO SECTION */}
      <section className="relative mb-16 reveal opacity-0">
        {/* Parallax soft glow background */}
        <div
          ref={heroBgRef}
          className="
            absolute inset-0 
            bg-gradient-to-br from-blue-50 via-white to-blue-100 
            opacity-70 blur-3xl 
            rounded-3xl
          "
        ></div>

        {/* Soft spark particles */}
        <span className="spark w-3 h-3 top-10 left-1/3"></span>
        <span className="spark w-2.5 h-2.5 top-24 left-1/2"></span>
        <span className="spark w-3 h-3 top-16 right-1/3"></span>
        <span className="spark w-2 h-2 bottom-4 right-1/4"></span>

        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-700 drop-shadow-sm">
            The XPosiGuide
          </h1>

          <p className="text-neutral-700 text-lg sm:text-xl max-w-3xl mx-auto mt-4">
            A structured radiographic positioning guide for students and professionals.
          </p>

          <p className="mt-5 text-blue-600 font-semibold text-xl">
            Position ∘ Expose ∘ Diagnose
          </p>
          <ProTips />
        </div>
      </section>

      {/* ⭐ MODULES */}
      <section className="mt-16 mb-20 reveal opacity-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-8">
          Explore Modules
        </h2>

        <div
          className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            lg:grid-cols-4 
            xl:grid-cols-5 
            gap-8 
            mx-auto
          "
        >
          {[
            {
              href: "/upper-extremities",
              img: "/assets/upper-extremities.png",
              title: "Upper Extremities",
              text: "Hand, wrist, forearm, elbow, humerus, shoulder positioning and projections.",
            },
            {
              href: "/lower-extremities",
              img: "/assets/lower-extremities.png",
              title: "Lower Extremities",
              text: "Foot, ankle, tibia/fibula, knee, femur: accurate positioning resources.",
            },
            {
              href: "/pelvic-girdle",
              img: "/assets/pelvic_girdle.png",
              title: "Pelvic Girdle/Vertebral Column",
              text: "Pelvis & hip projections including AP pelvis, inlet/outlet, frog-leg views.",
            },
            {
              href: "/xposilearn",
              img: "/assets/xposilearn.png",
              title: "XPosiLearn",
              text: "Study hub with notes, past papers, and reference resources.",
            },
            {
              href: "/xposi-ai",
              img: "/assets/xposi-ai.png",
              title: "XPosi AI",
              text: "AI assistant that reads, explains, and teaches radiography concepts.",
            },
          ].map((card, i) => (
            <Link
              key={card.title}
              href={card.href}
              onMouseMove={handleTiltMove}
              onMouseLeave={handleTiltLeave}
              className="
                group 
                overflow-hidden rounded-2xl 
                border border-transparent
                bg-gradient-to-br from-blue-100 via-white to-blue-50
                [padding:1px]
                shadow-sm hover:shadow-xl 
                transition-all duration-300 
                text-left 
                opacity-0 reveal
              "
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="rounded-2xl bg-white h-full">
                <div className="relative w-full aspect-[4/3] bg-white rounded-t-2xl">
                  <Image
                    src={card.img}
                    alt={card.title}
                    fill
                    className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-blue-700">
                    {card.title}
                  </h3>
                  <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                    {card.text}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      {/* ⭐ ANNOUNCEMENTS */}
          <section className="mt-30 mb-28 reveal opacity-0">
            <div
              className="
                w-full max-w-[1500px] mx-auto
                bg-blue-100 border border-blue-300 
                rounded-3xl p-10 shadow-md
              "
            >
              <h2 className="text-3xl font-bold text-blue-700 mb-6">
                🗣️ TheXposi Quick Briefs
              </h2>

              <AnnouncementsWidget />
            </div>
          </section>

      {/* ⭐ WHY SECTION */}
      <section className="mt-20 reveal opacity-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-8">
          Why The XPosiGuide?
        </h2>
                <div
          className="
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
            gap-8 max-w-[1400px] mx-auto
          "
        >
          {[
            {
              emoji: "🎨",
              title: "Visual Learning",
              desc: "Clean diagrams and illustrations make positioning intuitive.",
            },
            {
              emoji: "🎯",
              title: "Precision Focused",
              desc: "Every projection emphasizes alignment, angles, and CR placement.",
            },
            {
              emoji: "⚡",
              title: "Repo-Driven",
              desc: "Simply drop Markdown files into your repo to add content instantly.",
            },
          ].map((f, i) => (
            <div
              key={f.title}
              className="
                rounded-2xl bg-white 
                border border-neutral-200 
                p-6 shadow-sm 
                hover:shadow-md hover:-translate-y-1 
                transition reveal opacity-0
              "
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="text-4xl mb-4">{f.emoji}</div>
              <h3 className="font-semibold text-lg text-neutral-800">
                {f.title}
              </h3>
              <p className="text-neutral-600 text-sm mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
        {/* INTRO VIDEO with subtle focus glow */}
          <div className="flex justify-center mt-10">
            <div
              className="
                relative w-full max-w-4xl 
                aspect-video 
                rounded-2xl overflow-hidden 
                shadow-xl ring-1 ring-black/5
                reveal opacity-0
                mb-10
              "
            >
              <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/30 via-cyan-400/20 to-emerald-400/30 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
              <video
                className="w-full h-full object-cover"
                controls
                preload="metadata"
                poster="/assets/XPosiGuide-Intro-thumb.jpg.png"
              >
                <source src="/assets/XPosiGuide-Intro.mp4" type="video/mp4" />
              </video>
            </div>
          </div>


      </section>

      {/* ⭐ IMAGE GALLERY */}
      <section className="mt-20 reveal opacity-0">
        <h2 className="text-2xl sm:text-3xl font-semibold text-blue-700 mb-8">
          Glimpse into Practice
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: "cervical-spin-ap-positioning",
              title: "Cervical Spine — AP Positioning",
              desc: "Patient setup for AP cervical projection.",
            },
            {
              name: "lat-knee-positioning",
              title: "Lateral Knee Positioning",
              desc: "True lateral knee positioning with proper flexion.",
            },
            {
              name: "ap-foot-positioning",
              title: "AP Foot Projection Setup",
              desc: "AP foot view with correct CR and detector alignment.",
            },
            {
              name: "pa-hand-positioning",
              title: "PA Hand Projection",
              desc: "Standard PA hand projection positioning.",
            },
            {
              name: "radiographic-positions",
              title: "Radiographic Positions Overview",
              desc: "Summary of essential positioning techniques.",
            },
            {
              name: "x-ray-set-up",
              title: "X-Ray Equipment Setup",
              desc: "Tube–detector–patient alignment demonstration.",
            },
          ].map((img, i) => (
            <div
              key={img.name}
              className="
                rounded-2xl overflow-hidden shadow-sm 
                hover:shadow-lg transition bg-white
                reveal opacity-0
              "
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="relative aspect-[4/3]">
                <GalleryImage
                  baseName={img.name}
                  className="object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-5 text-left">
                <h3 className="text-lg font-semibold text-blue-700 mb-1">
                  {img.title}
                </h3>
                <p className="text-sm text-neutral-600">{img.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


    {/*  Return to Top */}

      <ReturnToTop />

      {/* ⭐ NEWSLETTER */}
      <section className="relative mt-20 mb-16 px-4 reveal opacity-0">
        <div
          className="
            max-w-3xl mx-auto 
            overflow-hidden 
            rounded-3xl 
            shadow-lg 
            bg-gradient-to-br from-blue-700 to-blue-500 
            text-white p-10 
            relative
          "
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Join The XPosiGuide Newsletter
            </h2>
            <p className="text-white/90 text-sm sm:text-base mb-6 max-w-md mx-auto">
              Get module updates, study resources, and radiography learning
              tools.
            </p>

            <div
              className="ml-embedded mx-auto bg-white rounded-2xl p-6 max-w-sm"
              data-form="R6RPfh"
            ></div>
          </div>
        </div>
      </section>

      {/* ⭐ FOOTER */}
      <footer className="mt-14 border-t border-neutral-200 pt-6 pb-8 text-sm text-neutral-500 reveal opacity-0">
        <p className="max-w-2xl mx-auto">
          <strong>Disclaimer:</strong> For educational purposes only. Always
          follow institutional protocols.
        </p>
      </footer>
    </main>
  );
}
