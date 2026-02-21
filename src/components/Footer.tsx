// src/components/Footer.tsx
import React from "react";
import { MdInfoOutline, MdArticle } from "react-icons/md";
import { FaGithub } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    /* mt-32 is REMOVED. pt-32 handles the space while keeping the background connected */
    <footer className="relative pt-32 text-gray-400 overflow-hidden w-full">
      
      {/* 1. DARK BACKGROUND: Fills the entire footer area */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
      
      {/* 2. THE GLOW EFFECT: The large blue aura behind the content */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none" />
      
      {/* 3. SUBTLE GRID: Pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* 4. TOP ACCENT LINE: Horizontal separator */}
      <div className="relative h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* LEFT SIDE */}
          <div className="space-y-6">
            <h3 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
              The XPosiGuide
            </h3>
            <p className="text-sm text-gray-500 max-w-md leading-relaxed">
              Advanced radiography education platform powered by AI-driven 
              projection tools and intelligent document analysis.
            </p>

            <div className="group flex gap-4 items-start max-w-md bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 transition-all duration-500 hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
              <MdInfoOutline className="text-blue-400 shrink-0" size={22} />
              <div className="text-xs leading-relaxed italic">
                <span className="text-gray-200 font-semibold block mb-2 tracking-wide">Clinical Disclaimer</span>
                This platform is strictly for educational purposes. Always follow institutional protocols.
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col md:items-end gap-8">
            <div className="flex gap-6 items-center">
              <a href="https://github.com/Jaks-Tech" target="_blank" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all">
                <FaGithub size={22} className="hover:text-blue-400 transition-colors" />
              </a>
              <a href="#" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all">
                <MdArticle size={24} className="hover:text-blue-400 transition-colors" />
              </a>
            </div>
            <p className="text-[11px] tracking-[0.35em] uppercase text-gray-600 font-semibold">Precision in Positioning</p>
          </div>
        </div>

        {/* BOTTOM STRIP */}
        <div className="mt-20 pt-10 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs">
          <p className="text-gray-500">
            © {currentYear} <span className="text-gray-300 font-medium">The XPosiGuide</span>. Built for Radiography Students and Practitioners.
          </p>
          <div className="flex gap-8 uppercase tracking-wide font-medium text-gray-500">
            <a href="/" className="hover:text-white transition-colors">Privacy</a>
            <a href="/" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}