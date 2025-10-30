"use client";
import { useState } from "react";

export default function AIAnswerBox({ content }: { content: string }) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleAskAI = async () => {
    setLoading(true);
    const res = await fetch("/api/ask-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context: content, question: "Explain or answer this." }),
    });
    const data = await res.json();
    setAnswer(data.answer || "No response available.");
    setLoading(false);
  };

  const handleReadAnswer = () => {
    if (!answer) return;

    // Stop if currently speaking
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.rate = 1; // normal speed
    utterance.pitch = 1; // natural tone
    utterance.lang = "en-US";

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
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
        <div className="mt-5 p-4 bg-white border rounded-md text-sm text-neutral-800">
          <p className="whitespace-pre-wrap">{answer}</p>

          {/* Voice-over controls */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleReadAnswer}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                speaking
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {speaking ? "⏹ Stop Reading" : "🔊 Read Answer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
