"use client";
import React from "react";
import Link from "next/link";
import { 
  MdMailOutline, 
  MdPhoneInTalk, 
  MdLanguage, 
  MdOutlineHelpCenter,
  MdArrowForward
} from "react-icons/md";

export default function SupportPage() {
  const contactMethods = [
    {
      icon: <MdMailOutline size={28} />,
      title: "Email Support",
      detail: "hello@jakslab.work",
      description: "For project inquiries, data requests, or detailed technical help.",
      href: "mailto:hello@jakslab.work",
      label: "Send an email"
    },
    {
      icon: <MdPhoneInTalk size={28} />,
      title: "Direct Line",
      detail: "+254 702 527 918",
      description: "Available for urgent assistance and radiography student support.",
      href: "tel:+254702527918",
      label: "Call now"
    },
    {
      icon: <MdLanguage size={28} />,
      title: "Official Website",
      detail: "xposiguide.co.ke",
      description: "Access our full library of projections and AI-driven tools.",
      href: "https://www.xposiguide.co.ke/",
      label: "Visit site"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <main className="max-w-5xl mx-auto px-6 py-20">
        <Link href="/" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-2 mb-10">
          <span>←</span> Back to Home
        </Link>

        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-100">
                <MdOutlineHelpCenter size={28} />
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900">Support Hub</h1>
          </div>
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
            Need help with <strong>XPosi AI</strong>, project revisions, or account access? 
            Our team at Jaks-Tech is ready to assist you.
          </p>
        </header>

        {/* CONTACT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method) => (
            <a 
              key={method.title}
              href={method.href}
              target={method.title === "Official Website" ? "_blank" : undefined}
              className="group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-blue-500/30 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
            >
              <div className="text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                {method.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{method.title}</h3>
              <p className="text-blue-600 font-bold mb-4 tracking-tight">{method.detail}</p>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {method.description}
              </p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">
                {method.label} <MdArrowForward />
              </div>
            </a>
          ))}
        </div>

        {/* BOTTOM SECTION: MISSION */}
        <div className="p-12 bg-slate-900 rounded-[3rem] text-white overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-3xl font-black tracking-tight">Student-First Support</h2>
              <p className="text-slate-400 max-w-md leading-relaxed">
                Whether you're struggling with a specific projection or need help with XPosiLearn, 
                we respond to most inquiries within 24 hours.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <span className="text-xs font-bold tracking-[0.3em] uppercase text-blue-500 mb-2">Location</span>
              <p className="text-xl font-bold text-slate-100 uppercase tracking-tighter">Nairobi, Kenya</p>
            </div>
          </div>
          
          {/* DECORATIVE BACKGROUND ELEMENT */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
        </div>

        <footer className="mt-20 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} The XPosiGuide by Jaks-Tech</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}