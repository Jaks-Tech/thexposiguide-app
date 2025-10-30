 "use client";

import { useState } from "react";

export default function AIAnswerBox({ context }: { context: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context }),
      });

      const data = await res.json();
      setAnswer(data.answer || "No response generated.");
    } catch {
      setAnswer("⚠️ There was a problem contacting the AI service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-blue-50 dark:bg-neutral-900/40 border border-blue-100 p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-blue-700 mb-3">
        💡 Ask XPosiLearn AI
      </h2>
      <p className="text-sm text-neutral-700 mb-3">
        Ask any question about this paper — the AI tutor will provide guidance.
      </p>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g. Explain the projection setup in this test..."
        className="w-full border rounded-md p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
      />

      <button
        onClick={handleAsk}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm"
      >
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {answer && (
        <div className="mt-4 p-4 bg-white border-l-4 border-blue-500 text-sm text-gray-800 rounded-md shadow-sm whitespace-pre-wrap">
          {answer}
        </div>
      )}
    </div>
  );
}

