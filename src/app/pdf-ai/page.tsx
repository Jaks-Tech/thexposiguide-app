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
      pt-16 
      pb-20
    ">

      {/* PAGE TITLE */}
      <h1 className="
        text-3xl 
        sm:text-4xl 
        font-bold 
        text-blue-700 
        mb-3
        text-center
      ">
        Chat With Your Doc
      </h1>

      {/* DESCRIPTION — phone scalable */}
      <p className="
        text-slate-500 
        text-sm 
        sm:text-base 
        text-center 
        max-w-lg 
        mx-auto 
        px-4 
        mb-6 
        sm:mb-10
        leading-relaxed
      ">
        Upload any PDF or Word file (notes, protocol, guideline) and let our PDF AI 
        extract key points, answer questions, and explain content - directly from your file.
      </p>

      {/* MAIN CHAT CARD */}
      <div className="
        w-full 
        max-w-7xl 
        bg-white 
        shadow-2xl 
        rounded-3xl 
        border 
        border-slate-200 
        p-4 
        sm:p-8 
        mx-auto
      ">
        <PDFChatClient />
      </div>

      {/* DISCLAIMER */}
      <p className="
        mt-6 
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
