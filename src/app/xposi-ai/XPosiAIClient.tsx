"use client";

import React, { useState, useRef, useEffect } from "react";
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
  | "error"
  | "chat";

export default function XPosiAIClient({ paperMeta }: { paperMeta: PaperMeta }) {
  /* ------------------------------------------------------ */
  /* STATE MANAGEMENT                                        */
  /* ------------------------------------------------------ */
  const [status, setStatus] = useState<Status>("idle");
  const [activeTab, setActiveTab] = useState<"answers" | "chat">("answers");

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  /* Chat mode */
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([]);
  const [chatLoading, setChatLoading] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  /* Auto-scroll chat */
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  /* Progress bar */
  const isPreparing = status === "preparing";
  const isGenerating = status === "generating";
  const canPrepare = status === "idle" || status === "error";
  const canGenerate = status === "ready";

  const progress = {
    idle: 0,
    preparing: 40,
    ready: 60,
    generating: 85,
    done: 100,
    error: 0,
    chat: 0,
  }[status];

  /* ------------------------------------------------------ */
  /* 1️⃣ PREPARE PAPER                                        */
  /* ------------------------------------------------------ */
  async function handlePrepare() {
    try {
      setStatus("preparing");
      setError(null);
      setAnswer(null);
      setInfo("Downloading and extracting text…");

      const res = await fetch("/api/xposi-ai/prepare-extracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paperMeta),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setInfo(data.cached ? "Using cached extraction." : data.info);
      setStatus("ready");
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  }

  /* ------------------------------------------------------ */
  /* 2️⃣ GENERATE ANSWERS                                      */
  /* ------------------------------------------------------ */
  async function handleGenerate() {
    try {
      setStatus("generating");
      setError(null);
      setInfo("Generating complete answers…");

      const res = await fetch("/api/xposi-ai/generate-ai-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId: paperMeta.id }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setAnswer(data.answer);
      setStatus("done");
      setInfo(null);
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  }

  /* ------------------------------------------------------ */
  /* 3️⃣ CHAT MODE (Messenger)                                */
  /* ------------------------------------------------------ */
  async function handleChatSubmit() {
    if (!chatInput.trim()) return;

    const msg = chatInput.trim();
    setChatInput("");

    // Add user bubble
    setChatHistory((prev) => [...prev, { sender: "user", text: msg }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/xposi-ai/chat-fallback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: msg }),
      });

      const data = await res.json();

      // Add AI bubble
      setChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: data.answer || "I couldn't generate a response." },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  /* ------------------------------------------------------ */
  /* 4️⃣ TEXT-TO-SPEECH                                        */
  /* ------------------------------------------------------ */
  function handleSpeech() {
    if (!answer) return;

    const clean = answer.replace(/\n+/g, ". ");
    const utter = new SpeechSynthesisUtterance(clean);

    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  }

  /* ------------------------------------------------------ */
  /* UI                                                     */
  /* ------------------------------------------------------ */
  return (
    <div className="w-full flex flex-col p-5 rounded-xl border bg-blue-50 border-blue-200 shadow-sm">

      {/* -------------------------------------------------- */}
      {/* TAB SWITCHER                                        */}
      {/* -------------------------------------------------- */}
      <div className="flex mb-6 border-b">
        <button
          className={`flex-1 py-2 text-center font-semibold ${
            activeTab === "answers"
              ? "border-b-4 border-blue-600 text-blue-700"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("answers")}
        >
          📘 Generate Answers
        </button>

        <button
          className={`flex-1 py-2 text-center font-semibold ${
            activeTab === "chat"
              ? "border-b-4 border-blue-600 text-blue-700"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("chat")}
        >
          💬 Chat
        </button>
      </div>
    {/* ========================= */}
    {/* TAB CONTENT */}
    {/* ========================= */}
        {activeTab === "answers" && (
          <div>
            {/* Metadata */}
            <div className="flex flex-wrap gap-2 text-xs mb-3">
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

            {/* Progress Bar */}
            <p className="text-sm text-gray-700 mb-2">
              {status === "idle" && "Load this paper and begin extraction."}
              {status === "preparing" && "Extracting text…"}
              {status === "ready" && "Ready to generate full answers."}
              {status === "generating" && "Generating answers…"}
              {status === "done" && "Answers generated below."}
              {status === "error" && "An error occurred."}
            </p>

            <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${progress}%` }}
                className={`h-full transition-all ${
                  progress === 100 ? "bg-green-600" : "bg-blue-600"
                }`}
              ></div>
            </div>

              {!answer && status !== "generating" && status !== "done" && (
                <div className="mt-12 mb-8 text-center px-6">
                  {/* Minimalist Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-6">
                    <span className="text-2xl">✨</span>
                  </div>

                  {/* Primary Message */}
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    XPosi AI is Ready
                  </h3>

                  {/* The Simple Statement */}
                  <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
                    Upload <span className="font-semibold text-blue-600">non-scanned documents</span> for instant answers, 
                    or switch to <span className="font-semibold text-indigo-600">Chat mode</span> to discuss scanned papers.
                  </p>

                  {/* Subtle visual divider */}
                  <div className="mt-8 flex justify-center gap-1">
                    <div className="h-1 w-1 bg-slate-200 rounded-full"></div>
                    <div className="h-1 w-8 bg-slate-200 rounded-full"></div>
                    <div className="h-1 w-1 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
              )}

            {/* ========================= */}
            {/* Buttons */}
            {/* ========================= */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                disabled={!canPrepare}
                onClick={handlePrepare}
                className={`flex-1 py-2 font-semibold text-white rounded-md ${
                  !canPrepare ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isPreparing ? "Preparing…" : "1️⃣ Upload this Paper"}
              </button>

              <button
                disabled={!canGenerate}
                onClick={handleGenerate}
                className={`flex-1 py-2 font-semibold text-white rounded-md ${
                  !canGenerate ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isGenerating ? "Generating…" : "2️⃣ Generate Answers"}
              </button>
            </div>

                {/* Info */}
                {info && status !== "done" && status !== "chat" && (
                  <div className="mt-3 p-3 bg-gray-50 border text-xs rounded font-mono">
                    {info}
                  </div>
                )}

            {/* Error */}
            {error && (
              <div className="mt-4 text-sm p-3 bg-red-50 text-red-700 border rounded">
                {error}
              </div>
            )}

            {/* Output */}
            {answer && (
              <div className="mt-6 p-5 bg-white border rounded shadow">
                <div className="prose">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {answer}
                  </Markdown>
                </div>
                <button
                  onClick={handleSpeech}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
                >
                  🔊 Read Answer
                </button>
              </div>
            )}

          </div>
        )}


{/* -------------------------------------------------- */}
{/* TAB 2: CHAT MODE (MESSENGER UPGRADED)              */}
{/* -------------------------------------------------- */}
{activeTab === "chat" && (
  <div className="flex flex-col max-h-[70vh] min-h-[300px] border rounded-lg bg-white p-3">

    {/* Chat message list */}
    <div className="flex-1 overflow-y-auto space-y-4 p-2">
      {chatHistory.map((msg, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 ${
            msg.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {/* Avatar */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shadow ${
              msg.sender === "user" ? "bg-blue-600" : "bg-emerald-600"
            }`}
          >
            {msg.sender === "user" ? "🧑" : "🤖"}
          </div>

          {/* Bubble */}
          <div
            className={`max-w-[75%] px-4 py-2 rounded-2xl prose prose-sm break-words shadow-sm ${
              msg.sender === "user"
                ? "bg-blue-200 text-white rounded-br-none"
                : "bg-gray-100 text-gray-900 rounded-bl-none"
            }`}
          >
            <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {chatLoading && (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <span className="animate-pulse">🤖 Typing…</span>
        </div>
      )}

      <div ref={chatBottomRef} />
    </div>

    {/* Composer */}
    <div className="border-t pt-3 mt-3">
      <textarea
        value={chatInput}
        placeholder="Ask anything…"
        className="w-full border rounded-lg p-3 text-sm resize-none overflow-hidden focus:ring-2 focus:ring-blue-500"
        onChange={(e) => {
          setChatInput(e.target.value);

          // Auto-expand textarea
          const el = e.target;
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
        }}
        rows={1}
        style={{ minHeight: "42px", maxHeight: "200px" }}
      />

      <button
        onClick={handleChatSubmit}
        disabled={chatLoading || !chatInput.trim()}
        className="mt-2 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        {chatLoading && (
          <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
        )}
        {chatLoading ? "Sending…" : "Send 💬"}
      </button>
    </div>
  </div>
)}  
    </div>
  );
}
