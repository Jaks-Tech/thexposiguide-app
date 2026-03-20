// /app/pdf-ai/page.tsx
'use client';

import { useEffect } from "react";
import PDFChatClient from "@/components/pdf-ai/PDFChatClient";

export default function PDFPage() {

  // ⚡ Keep scrollRestoration = "auto" ONLY on this page
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "auto";
    }
    // Prevent auto-jumping on mount (some devices jump to bottom)
    window.scrollTo(0, 0);
  }, []);

  return (
<div className="
  w-full 
  min-h-screen 
  bg-white 
  flex flex-col 
  items-center 
  pt-10
  pb-10
">
  {/* PAGE TITLE */}
  <h1 className="
    text-3xl 
    sm:text-5xl 
    font-black 
    text-blue-700 
    mb-6
    text-center
    tracking-tight
  ">
    Chat With Your Doc
  </h1>

  {/* CONTAINER CARD WITH FADED OUTLINE */}
  <div className="
    relative 
    max-w-2xl 
    mx-auto 
    mb-10 
    sm:mb-14 
    px-6 
    py-10 
    sm:py-12 
    rounded-[3rem] 
    bg-white 
    border border-slate-200/50 
    shadow-[0_8px_40px_rgba(0,0,0,0.02)]
  ">
    {/* Faded Outline Glow Layers */}
    <div className="absolute inset-0 -z-10 rounded-[3rem] ring-1 ring-slate-100 scale-[1.01]" />
    <div className="absolute inset-0 -z-10 rounded-[3rem] ring-[12px] ring-slate-50/50 scale-[1.04] blur-sm" />
    <div className="absolute inset-0 -z-10 rounded-[3rem] ring-[24px] ring-blue-50/20 scale-[1.08] blur-md" />

    {/* DESCRIPTION — phone scalable */}
    <p className="
      text-slate-500 
      text-sm 
      sm:text-lg 
      text-center 
      max-w-md 
      mx-auto 
      px-4 
      leading-relaxed
      font-medium
    ">
      Upload any PDF or Word file <span className="text-slate-400 font-normal">(notes, protocol, guideline)</span> and let our 
      <span className="text-blue-600 font-bold"> PDF AI </span> 
      extract key points, answer questions, and explain content - directly from your file.
    </p>
  </div>


      {/* MAIN CHAT CARD */}
      <div className="
        w-full 
        max-w-8xl 
        bg-white 
        shadow-10xl 
        rounded-5xl 
        border 
        border-slate-1000 
        p-1 
        sm:p-10 
        mx-auto
      ">
        <PDFChatClient />
      </div>

      {/* DISCLAIMER */}
      <p className="
        mt-10 
        text-[10px] 
        sm:text-xs 
        text-slate-400 
        text-center
        px-4
      ">
        XPosi PDF AI is for educational use only — always confirm with institutional policies.
      </p>
    </div>
  );
}
