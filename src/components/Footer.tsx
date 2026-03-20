"use client";
import React from "react";
import Link from "next/link";
import { MdInfoOutline, MdArticle } from "react-icons/md";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Navigation Data
  const sections = [
    {
      title: "Projections",
      links: [
        { name: "Upper Extremities", href: "/upper-extremities" },
        { name: "Lower Extremities", href: "/lower-extremities" },
        { name: "Pelvic Girdle", href: "/pelvic-girdle" },
        { name: "Projections Studio", href: "/projections-studio" },
      ],
    },
    {
      title: "Learning Hub",
      links: [
        { name: "XPosiLearn", href: "/xposilearn" },
        { name: "Assignments", href: "/assignments" },
        { name: "Announcements", href: "/announcements" },
        { name: "Game Retreat", href: "/games" },
      ],
    },
    {
      title: "Intelligence",
      links: [
        { name: "XPosi AI", href: "/xposi-ai" },
        { name: "Chat-Your-PDF", href: "/pdf-ai" },
        { name: "Revision Workspace", href: "/revision-workspace" },
      ],
    },
  ];

  return (
    <footer className="relative pt-32 text-gray-400 overflow-hidden w-full font-sans">
      {/* --- BACKGROUND ELEMENTS --- */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      
      {/* TOP ACCENT LINE */}
      <div className="relative h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* COLUMN 1: BRANDING */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                The XPosiGuide
              </h3>
              <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                A specialized radiography ecosystem. We provide the tools and 
                intelligence required for clinical excellence and academic mastery.
              </p>
            </div>

            <div className="group flex gap-4 items-start max-w-sm bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 transition-all duration-500 hover:border-blue-500/40">
              <MdInfoOutline className="text-blue-500 shrink-0" size={20} />
              <div className="text-[11px] leading-relaxed italic text-gray-400">
                <span className="text-gray-200 font-bold block mb-1 uppercase tracking-wider">Clinical Notice</span>
                Strictly for educational use. Cross-reference all findings with local hospital protocols.
              </div>
            </div>
          </div>

          {/* COLUMNS 2, 3, 4: NAVIGATION MAP */}
          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-10">
            {sections.map((section) => (
              <div key={section.title} className="space-y-6">
                <h4 className="text-white font-bold text-xs tracking-[0.2em] uppercase">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href} 
                        className="text-sm text-gray-500 hover:text-blue-400 transition-colors duration-200 block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* COLUMN 5: QUICK ACTIONS */}
          <div className="lg:col-span-2 flex flex-col items-start lg:items-end gap-8">
            <h4 className="text-white font-bold text-xs tracking-[0.2em] uppercase">Resources</h4>
            <div className="flex gap-4">
              <a href="/xposi-ai" className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all group">
                <MdArticle size={22} className="group-hover:text-blue-400 transition-colors" />
                <span className="text-xs font-bold text-gray-300 pr-2">Past Papers</span>
              </a>
            </div>
            <div className="lg:text-right">
              <p className="text-[10px] tracking-[0.3em] uppercase text-blue-500 font-black">
                Precision in
              </p>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-black">
                Positioning
              </p>
            </div>
          </div>
        </div>

        {/* --- BOTTOM LEGAL STRIP --- */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <p>© {currentYear} The XPosiGuide</p>
            <span className="hidden md:block w-1.5 h-1.5 bg-blue-600/20 rounded-full" />
            <p>Radiography Intelligence</p>
          </div>
          
          <div className="flex gap-10 text-[10px] uppercase tracking-[0.2em] font-black text-gray-600">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/support" className="text-blue-600 hover:text-blue-400 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}