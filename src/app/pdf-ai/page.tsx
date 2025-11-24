// /app/pdf-ai/page.tsx
import PDFChatClient from "@/components/pdf-ai/PDFChatClient";

export default function PDFPage() {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center pt-16 pb-20">

      {/* PAGE TITLE */}
      <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-3">
        Chat With Your  File
      </h1>

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
      ">
        Upload any PDF or Word file (notes, protocol, guideline) and let Our PDF AI
        extract key points, answer questions, and explain content — directly from your file.
      </p>


      {/* ⬆ UPDATED: Wider Chat Container */}
      <div className="w-full max-w-7xl bg-white shadow-2xl rounded-3xl border border-slate-200 p-8">
        <PDFChatClient />
      </div>

      {/* DISCLAIMER */}
      <p className="mt-6 text-[20px] sm:text-xs text-slate-800 text-center">
        XPosi PDF AI is for educational use only - always confirm with institutional policies.
      </p>
    </div>
  );
}
