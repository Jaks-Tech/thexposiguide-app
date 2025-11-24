"use client";

import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type PaperMeta = {
  id: string;
  filename: string;
  path: string;
  year?: string | null;
  semester?: number | null;
  unit_name?: string | null;
};

type Status =
  | "idle"
  | "preparing"
  | "ready"
  | "generating"
  | "done"
  | "error";

export default function XPosiAIClient({ paperMeta }: { paperMeta: PaperMeta }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  /* ------------------------------------------------------ */
  /* Computed Flags                                          */
  /* ------------------------------------------------------ */

  const canPrepare = status === "idle" || status === "error";
  const canGenerate = status === "ready";

  /* ------------------------------------------------------ */
  /* 1️⃣ PREPARE PAPER (OCR + Extract + Chunking)             */
  /* ------------------------------------------------------ */
  async function handlePrepare() {
    try {
      setStatus("preparing");
      setError(null);
      setInfo("Extracting text…");

      const res = await fetch("/api/xposi-ai/prepare-extracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paperMeta),
      });

      const data = await res.json();
      console.log("PREPARE RESPONSE:", data);

      if (!data.success) throw new Error(data.error);

      if (data.cached) {
        setInfo("✔ This paper was already prepared earlier.");
      } else {
        setInfo(data.info || "✔ Extraction completed.");
      }

      setStatus("ready");
    } catch (err: any) {
      setError(err.message || "Failed to prepare this paper.");
      setStatus("error");
    }
  }

  /* ------------------------------------------------------ */
  /* 2️⃣ GENERATE ANSWERS                                     */
  /* ------------------------------------------------------ */
  async function handleGenerate() {
    try {
      setStatus("generating");
      setError(null);
      setInfo("Generating AI answers…");

      const res = await fetch("/api/xposi-ai/generate-ai-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId: paperMeta.id }),
      });

      const data = await res.json();
      console.log("GENERATE RESPONSE:", data);

      if (!data.success) throw new Error(data.error);

      setAnswer(data.answer);
      setStatus("done");
      setInfo(null);
    } catch (err: any) {
      setError(err.message || "Failed to generate answers.");
      setStatus("error");
    }
  }

  /* ------------------------------------------------------ */
  /* TEXT-TO-SPEECH                                          */
  /* ------------------------------------------------------ */
  function handleSpeech() {
    if (!answer) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const clean = answer
      .replace(/[#_*~`>]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\n+/g, ". ");

    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.pitch = 1;

    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  }

  /* ------------------------------------------------------ */
  /* STATUS TEXT                                             */
  /* ------------------------------------------------------ */
  function statusText(): string {
    switch (status) {
      case "idle":
        return "Step 1: Load this paper into XPosi AI.";
      case "preparing":
        return info || "Extracting text…";
      case "ready":
        return "Step 2: Extraction complete. Generate answers.";
      case "generating":
        return "Generating full answers…";
      case "done":
        return "Answers generated below.";
      case "error":
        return "An error occurred. Please try again.";
      default:
        return "";
    }
  }

  /* ------------------------------------------------------ */
  /* UI                                                      */
  /* ------------------------------------------------------ */
  return (
    <div className="mt-10 p-6 rounded-xl border border-blue-200 bg-blue-50 shadow-sm">
      <h2 className="text-xl font-semibold text-blue-700 mb-3">
        🤖 XPosi AI Assistant
      </h2>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-xs mb-4">
        {paperMeta.year && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
            {paperMeta.year.replace("year-", "Year ")}
          </span>
        )}
        {paperMeta.semester && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
            S{paperMeta.semester}
          </span>
        )}
        {paperMeta.unit_name && (
          <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full">
            {paperMeta.unit_name}
          </span>
        )}
      </div>

      <p className="text-sm text-neutral-700 mb-3">{statusText()}</p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">

          {/* PREPARE BUTTON */}
          <button
            type="button"
            onClick={handlePrepare}
            disabled={!canPrepare}
            className={`flex-1 px-4 py-2 rounded-md font-semibold text-white transition ${
              !canPrepare
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {status === "preparing" ? "Preparing…" : "1️⃣ Upload & Extract Text"}
          </button>

          {/* GENERATE BUTTON */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`flex-1 px-4 py-2 rounded-md font-semibold text-white transition ${
              !canGenerate
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {status === "generating" ? "Generating…" : "2️⃣ Generate Full Answers"}
          </button>

        </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Info */}
      {info && !error && status !== "done" && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 text-xs font-mono rounded">
          {info}
        </div>
      )}

      {/* Output */}
      {answer && (
        <div className="mt-6 p-5 bg-white border rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-emerald-700 mb-3">
            ✅ Generated Answers
          </h3>

          <div className="prose prose-sm">
            <Markdown remarkPlugins={[remarkGfm]}>{answer}</Markdown>
          </div>

          <button
            type="button"
            onClick={handleSpeech}
            className={`mt-4 px-4 py-2 rounded-md text-sm text-white ${
              speaking
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {speaking ? "⏹ Stop Reading" : "🔊 Read Answer"}
          </button>
        </div>
      )}
    </div>
  );
}
