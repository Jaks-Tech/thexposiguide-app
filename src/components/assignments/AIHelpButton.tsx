"use client";

import { useState } from "react";
import { Sparkles, Loader2, ChevronUp, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AIHelpButton({ assignment }: { assignment: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  const getAIGuidance = async () => {
    if (isOpen && suggestion && !loading) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    if (!suggestion) {
      setLoading(true);
      try {
        const response = await fetch("/api/assignment-ai-guide", {
          method: "POST",
          body: JSON.stringify({
            title: assignment.title,
            description: assignment.description,
            unit: assignment.unit_name,
          }),
        });
        const data = await response.json();
        setSuggestion(data.guide);
      } catch (err) {
        setSuggestion("Sorry, I couldn't generate a guide right now.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full space-y-3">
      <button
        onClick={getAIGuidance}
        disabled={loading}
        className={`flex items-center justify-center gap-2 w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3 rounded-xl transition-all border border-indigo-100 shadow-sm active:scale-[0.98] ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4 text-indigo-500" />
        )}
        {loading ? "Thinking..." : isOpen ? "Hide AI Guide" : "Generate AI Assignment Guide"}
      </button>

      {isOpen && (
        <div className="overflow-hidden bg-gradient-to-b from-indigo-50/50 to-white border border-indigo-100 rounded-2xl transition-all duration-300 animate-in slide-in-from-top-2">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4 text-indigo-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] font-black uppercase tracking-widest">
                XPosiGuide AI Insights
              </span>
            </div>

            {loading ? (
              <div className="space-y-3 py-2">
                <div className="h-3 w-3/4 bg-indigo-200/50 animate-pulse rounded" />
                <div className="h-3 w-full bg-indigo-200/50 animate-pulse rounded" />
                <div className="h-3 w-5/6 bg-indigo-200/50 animate-pulse rounded" />
              </div>
            ) : (
              /* ✨ THE MARKDOWN RENDERER */
              <div className="prose prose-sm prose-indigo max-w-none 
                prose-headings:text-indigo-900 prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-4
                prose-p:text-slate-700 prose-p:leading-relaxed
                prose-li:text-slate-700">
                
                <ReactMarkdown>{suggestion}</ReactMarkdown>
                
                <div className="mt-6 pt-4 border-t border-indigo-100 flex justify-between items-center">
                  <button 
                    onClick={() => { setSuggestion(""); setLoading(true); getAIGuidance(); }}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors uppercase tracking-tighter"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </button>
                  
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}