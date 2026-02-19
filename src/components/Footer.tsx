import React from "react";
import { MdInfoOutline, MdArticle } from "react-icons/md";
import { FaGithub } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-32 text-gray-400 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none" />
      
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Top Accent Line */}
      <div className="relative h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

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

            {/* Disclaimer Card */}
            <div className="group flex gap-4 items-start max-w-md bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 transition-all duration-500 hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
              <MdInfoOutline
                className="text-blue-400 shrink-0 transition-transform duration-300 group-hover:scale-110"
                size={22}
              />
              <div className="text-xs leading-relaxed italic">
                <span className="text-gray-200 font-semibold block mb-2 tracking-wide">
                  Clinical Disclaimer
                </span>
                This platform is strictly for educational purposes. 
                Always follow institutional protocols and radiologist supervision 
                during real-world clinical practice.
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col md:items-end gap-8">
            
            {/* Social Links */}
            <div className="flex gap-6 items-center">
              <a
                href="https://github.com/Jaks-Tech/thexposiguide-app"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <FaGithub
                  size={22}
                  className="transition-transform duration-300 group-hover:scale-110 group-hover:text-blue-400"
                />
              </a>

              <a
                href="#"
                className="group relative p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <MdArticle
                  size={24}
                  className="transition-transform duration-300 group-hover:scale-110 group-hover:text-blue-400"
                />
              </a>
            </div>

            {/* Tagline */}
            <p className="text-[11px] tracking-[0.35em] uppercase text-gray-600 font-semibold">
              Precision in Positioning
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-20 pt-10 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs">
          
          <p className="text-gray-500">
            © {currentYear}{" "}
            <span className="text-gray-300 font-medium">
              The XPosiGuide
            </span>
            . Built for Radiography Students.
          </p>

          <div className="flex gap-8 uppercase tracking-wide font-medium text-gray-500">
            <a
              href="/"
              className="relative group transition-colors hover:text-white"
            >
              Privacy
              <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </a>

            <a
              href="/"
              className="relative group transition-colors hover:text-white"
            >
              Terms
              <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
