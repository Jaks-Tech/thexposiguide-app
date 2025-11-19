"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import GalleryImage from "@/components/GalleryImage";
import AnnouncementsWidget from "@/components/AnnouncementsWidget";
import ReturnToTop from "@/components/ReturnToTop";
import ProTips from "@/components/ProTips";
import CircularRoadmap from "@/components/CircularRoadmap";
export default function HomePage() {
  const heroBgRef = useRef<HTMLDivElement | null>(null);

  /* -------------------------------------------------- */
  /* FADE-IN REVEAL ANIMATION */
  /* -------------------------------------------------- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("animate-fadeUp");
        }),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }, []);

  /* -------------------------------------------------- */
  /* HERO PARALLAX BACKGROUND */
  /* -------------------------------------------------- */
  useEffect(() => {
    const handleScroll = () => {
      if (!heroBgRef.current) return;
      heroBgRef.current.style.transform = `translateY(${
        window.scrollY * 0.15
      }px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* -------------------------------------------------- */
  /* 3D TILT EFFECT */
  /* -------------------------------------------------- */
  const handleTiltMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const midX = rect.width / 2;
    const midY = rect.height / 2;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateX = ((y - midY) / midY) * 6;
    const rotateY = ((x - midX) / midX) * -6;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const handleTiltLeave = (event: MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
  };

  return (
    <main className="w-full overflow-x-hidden text-center">

      {/* -------------------------------------------------- */}
      {/* GLOBAL ANIMATION + FX STYLES */}
      {/* -------------------------------------------------- */}
      <style>
        {`
          @keyframes fadeUp {
            0% { opacity: 0; transform: translateY(25px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeUp { animation: fadeUp .9s ease-out forwards; }

          @keyframes sparkle {
            0% { opacity: .3; transform: scale(.8); }
            50% { opacity: 1; transform: scale(1); }
            100% { opacity: .4; transform: scale(.9); }
          }
          .spark {
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(37,99,235,.9), transparent);
            animation: sparkle 5s ease-in-out infinite;
          }
        `}
      </style>
    {/* -------------------------------------------------- */}
    {/* 1️⃣ HERO SECTION — WHITE */}
    {/* -------------------------------------------------- */}
        <section className="relative w-full bg-white py-24 lg:py-32 overflow-hidden">
                
          {/* Parallax Glow Background */}
          <div
            ref={heroBgRef}
            className="absolute inset-0 w-full h-[120%] -top-[10%] bg-gradient-to-br from-blue-50 via-white to-blue-100 blur-3xl opacity-70 pointer-events-none"
          ></div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 reveal opacity-0">

            {/* Sparkle FX */}
            <span className="spark w-3 h-3 top-0 left-10"></span>
            <span className="spark w-4 h-4 top-20 right-20"></span>

            <div className="max-w-4xl mx-auto text-center">

              {/* MAIN TITLE — TWO-TONE LIKE YOUR EXAMPLE */}
              <h1 className="text-5xl sm:text-4xl lg:text-7xl font-extrabold leading-tight">
                <span className="text-neutral-900">Master Radiographic</span>{" "}
                <span className="text-blue-500">Positioning & AI Learning</span>
              </h1>

              {/* SUBTEXT — BRIEF + AI + CONNECTS NAVIGATION */}
              <p className="text-neutral-700 text-lg sm:text-xl mt-6 max-w-2xl mx-auto">
                A clear, modern radiographic guide that connects every module, projection, tool, and AI feature you need to learn with confidence.
              </p>
             

              {/* MOTTO */}
              <p className="mt-6 text-blue-500 font-semibold text-xl tracking-wide">
                Position ∘ Expose ∘ Diagnose
              </p>

           
              {/* PRO TIPS */}
              <div className="mt-12">
                
              </div>

            </div>
          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* 2️⃣ CIRCULAR ROADMAP — BLUE SECTION */}
        {/* -------------------------------------------------- */}
        <section className="w-full py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white mt-20">

          <div className="max-w-6xl mx-auto px-6 text-center">

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-bold mb-10 drop-shadow-lg">
              Your Radiography Learning Roadmap
            </h2>

            {/* Subtitle */}
            <p className="text-white/80 max-w-2xl mx-auto text-lg mb-16">
              A smooth guided pathway through all modules, projections, learning tools, 
              and AI assistance — designed to build strong diagnostic confidence.
            </p>

            {/* Circular Roadmap */}
            <div className="flex justify-center">
              <CircularRoadmap />
            </div>
          </div>

        </section>



      {/* -------------------------------------------------- */}
      {/* 3️⃣ ANNOUNCEMENTS — WHITE */}
      {/* -------------------------------------------------- */}
      <section className="w-full py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 reveal opacity-0">
          <div className="bg-blue-50 border border-blue-200 p-10 shadow-lg rounded-3xl">
            <h2 className="text-3xl font-bold text-blue-600 mb-6">
              🗣️ TheXposi Quick Briefs
            </h2>
            <ProTips />
            <AnnouncementsWidget />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 4️⃣ WHY + VIDEO — SOFT BLUE GRADIENT */}
      {/* -------------------------------------------------- */}
      {/* UPDATED: Lighter, softer blue gradient */}
      <section className="w-full py-24 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 reveal opacity-0">
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-12">Why The XPosiGuide?</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                emoji: "🎨",
                title: "Visual Learning",
                desc: "Illustrations & diagrams simplify complex positioning.",
              },
              {
                emoji: "🎯",
                title: "Precision Focused",
                desc: "Emphasizes CR placement, anatomy, alignment.",
              },
              {
                emoji: "⚡",
                title: "Structured & Clear",
                desc: "Everything presented in clean, digestible modules.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white text-neutral-900 p-8 rounded-2xl shadow-lg hover:-translate-y-1 transition"
              >
                <div className="text-5xl mb-4">{item.emoji}</div>
                <h3 className="font-bold text-xl mb-2 text-blue-600">{item.title}</h3>
                <p className="text-neutral-600">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Video */}
          <div className="flex justify-center mt-20">
            <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
              <video
                controls
                preload="metadata"
                poster="/assets/XPosiGuide-Intro-thumb.jpg.png"
                className="w-full h-full object-cover"
              >
                <source src="/assets/XPosiGuide-Intro.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 5️⃣ GALLERY — WHITE */}
      {/* -------------------------------------------------- */}
      <section className="w-full py-24 bg-white border-t border-neutral-100">
        <div className="max-w-[1700px] mx-auto px-6 reveal opacity-0">
          
          <h2 className="text-3xl sm:text-4xl font-semibold text-blue-600 mb-12">
            Glimpse into Practice
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                name: "cervical-spin-ap-positioning",
                title: "Cervical Spine — AP Positioning",
                desc: "Patient setup for an AP cervical projection.",
              },
              {
                name: "lat-knee-positioning",
                title: "Lateral Knee Positioning",
                desc: "True lateral knee alignment demonstration.",
              },
              {
                name: "ap-foot-positioning",
                title: "AP Foot Projection Setup",
                desc: "Correct CR and detector alignment.",
              },
              {
                name: "pa-hand-positioning",
                title: "PA Hand Projection",
                desc: "Standard PA hand positioning steps.",
              },
              {
                name: "radiographic-positions",
                title: "Radiographic Positions Overview",
                desc: "Summary of essential positioning techniques.",
              },
              {
                name: "x-ray-set-up",
                title: "X-Ray Equipment Setup",
                desc: "Tube–detector–patient relationship.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative aspect-[4/3]">
                  <GalleryImage baseName={item.name} className="object-cover" />
                </div>

                <div className="p-6 text-left">
                  <h3 className="text-lg font-bold text-blue-600">
                    {item.title}
                  </h3>
                  <p className="text-neutral-600 text-sm mt-2">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ReturnToTop />

      {/* -------------------------------------------------- */}
      {/* 6️⃣ NEWSLETTER — SOFT BLUE GRADIENT */}
      {/* -------------------------------------------------- */}
      {/* UPDATED: Lighter, softer blue gradient */}
      <section className="w-full py-24 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-6 reveal opacity-0">
          
          <div className="bg-white/10 backdrop-blur-md border border-white/30 p-10 rounded-3xl shadow-2xl">
            <h2 className="text-3xl font-extrabold mb-4">
              Join The XPosiGuide Newsletter
            </h2>
            <p className="text-blue-50 text-lg mb-8 max-w-xl mx-auto">
              Receive updates, tools, modules, and radiography insights directly to your inbox.
            </p>

            <div
              className="ml-embedded mx-auto bg-white rounded-2xl p-2 max-w-md overflow-hidden"
              data-form="R6RPfh"
            ></div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 7️⃣ FOOTER — WHITE */}
      {/* -------------------------------------------------- */}
      <footer className="w-full bg-white border-t border-neutral-200 py-10 text-sm text-neutral-500">
        <div className="max-w-7xl mx-auto px-6">
          <p>
            <strong>Disclaimer:</strong> For educational purposes only. Always
            follow institutional protocols.
          </p>
        </div>
      </footer>
    </main>
  );
}