"use client";
import { useState } from "react";

export default function AIAnswerBox({ content }: { content: string }) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    setLoading(true);
    const res = await fetch("/api/ask-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: content }),
    });
    const data = await res.json();
    setAnswer(data.answer);
    setLoading(false);
  };

  return (
    <div className="p-5 rounded-xl border border-blue-100 bg-blue-50 shadow-sm mt-8">
      <h2 className="text-xl font-semibold text-blue-700 mb-3">🤖 Ask XPosi AI</h2>
      <p className="text-sm text-neutral-700 mb-3">
        Click below to generate AI-based guidance or answers for this paper.
      </p>
      <button
        onClick={handleAskAI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
      >
        {loading ? "Analyzing..." : "Ask AI"}
      </button>

      {answer && (
        <div className="mt-4 p-3 bg-white border rounded-md text-sm text-neutral-800 whitespace-pre-wrap">
          {answer}
        </div>
      )}
    </div>
  );
}
