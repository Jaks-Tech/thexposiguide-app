"use client";

import { useState, useEffect, useRef } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import { BsFileEarmarkPdfFill } from "react-icons/bs";
import { LiaFileWordSolid } from "react-icons/lia";
import ReactMarkdown from "react-markdown";

type ChatMessage = {
  sender: "user" | "ai";
  text: string;
  time?: string;
};

export default function PDFChatClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfId, setPdfId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const allowedExtensions = ["pdf", "doc", "docx"];

  const now = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* ---------------- HELPER: SMART FORMATTING ---------------- */
  const preprocessText = (text: string) => {
    if (!text) return "";
    let clean = text.trim();

    // 1. Normalize bullets: Replace special char bullets (•) with Markdown bullets (*)
    clean = clean.replace(/•/g, "*");

    // 2. Split into lines to analyze structure
    const lines = clean.split("\n");

    if (lines.length > 0) {
      const firstLine = lines[0].trim();

      // Check if the FIRST line starts with a bullet (*, -, or 1.)
      // Regex explains: Start of line (^), followed by *, -, or number., then space
      const bulletMatch = firstLine.match(/^(\*|-|\d+\.)\s/);

      if (bulletMatch) {
        // FOUND IT: The Title is disguised as a bullet point.
        // 1. Remove the bullet from the first line
        const titleContent = firstLine.replace(/^(\*|-|\d+\.)\s/, "").trim();
        
        // 2. Make it a bold Header (###) and add a newline gap
        lines[0] = `### ${titleContent}\n`; 
        
        // 3. Join back together. 
        // We leave lines 1...n ALONE so their bullets stay intact.
        return lines.join("\n");
      }
    }

    // 3. Fallback: If no markdown exists at all (plain text block), apply formatting
    // only if it looks like a list of sentences separated by newlines.
    const hasAnyMarkdown = /^(#|\*|-|\d+\.)\s/m.test(clean);
    if (!hasAnyMarkdown && clean.includes("\n")) {
      const cleanLines = clean.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      if (cleanLines.length > 1) {
        const title = cleanLines[0];
        const bullets = cleanLines.slice(1);
        return `### ${title}\n\n${bullets.map(l => `* ${l}`).join("\n")}`;
      }
    }

    return clean;
  };

  /* ---------------- FILE SELECT ---------------- */
  function handleFileSelect(newFile: File | null) {
    if (!newFile) return;
    const ext = newFile.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      alert("Unsupported file type. Please upload a PDF or Word file.");
      return;
    }
    setFile(newFile);
    setMessages([]);
    setPdfId(null);
  }

  function cancelFileSelection() {
    setFile(null);
    setPdfId(null);
    setMessages([]);
  }

  /* ---------------- UPLOAD FILE ---------------- */
  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setMessages([]);
    setPdfId(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/xposi-ai/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error();

      setPdfId(data.pdf_id);
      setMessages([
        {
          sender: "ai",
          text: "📘 **File uploaded and indexed!** You may now ask questions.",
          time: now(),
        },
      ]);
    } catch {
      setMessages([{ sender: "ai", text: "❌ Upload failed.", time: now() }]);
    } finally {
      setUploading(false);
    }
  }

  /* ---------------- SEND MESSAGE ---------------- */
  async function handleSend() {
    if (!pdfId || !input.trim()) return;

    const question = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: question, time: now() },
    ]);

    setSending(true);
    setTyping(true);

    try {
      const res = await fetch("/api/xposi-ai/pdf-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf_id: pdfId, question }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.answer || "⚠️ No response returned.",
          time: now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "❌ AI request failed.", time: now() },
      ]);
    } finally {
      setSending(false);
      setTyping(false);
    }
  }

  /* ---------------- RENDER ---------------- */

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* CHAT WINDOW */}
      <div
        className="
          border rounded-3xl bg-white
          max-h-[70vh] min-h-[28rem]
          overflow-y-auto p-8 space-y-8 text-sm shadow-inner
        "
      >
        {/* PLACEHOLDER */}
        {!file && messages.length === 0 && (
          <div className="text-center flex flex-col items-center mt-6 space-y-6 select-none">
            <div className="relative w-28 h-28">
              <span className="absolute left-1/2 -translate-x-1/2 top-0 text-6xl animate-pulse">
                🤖
              </span>
              <span className="absolute left-1/2 -translate-x-1/2 bottom-0 text-6xl">
                📄
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-1 bg-blue-400 rounded-full opacity-60 animate-[scan_2.5s_linear_infinite]" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-blue-700 tracking-wide">
              Scan • Read • Explain
            </h3>

            <p className="text-slate-800 text-sm max-w-md leading-relaxed">
              Upload a PDF or Word file - XPosi AI will analyze and answer
              questions based strictly on its contents.
            </p>
          </div>
        )}

        {/* CHAT MESSAGES */}
        {file && (
          <>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${
                  m.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center 
                    text-white text-sm font-semibold shadow shrink-0
                    ${m.sender === "user" ? "bg-blue-600" : "bg-gray-700"}
                  `}
                >
                  {m.sender === "user" ? "You" : "AI"}
                </div>

                <div
                  className={`
                    max-w-[85%] sm:max-w-[75%] px-5 py-4 rounded-2xl shadow-sm overflow-hidden
                    ${
                      m.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-slate-200 text-slate-800"
                    }
                  `}
                >
                  {m.sender === "ai" ? (
                    <div
                      className="
                        prose prose-sm max-w-none 
                        prose-p:leading-relaxed prose-p:mb-2 last:prose-p:mb-0
                        prose-ul:list-disc prose-ul:pl-4 prose-ul:mb-2
                        prose-ol:list-decimal prose-ol:pl-4 prose-ol:mb-2
                        prose-li:marker:text-blue-600 prose-li:my-1
                        prose-strong:font-bold prose-strong:text-slate-900
                        prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-500
                        prose-headings:text-slate-900 prose-headings:font-bold prose-headings:mb-2
                      "
                    >
                      <ReactMarkdown>{preprocessText(m.text)}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {m.text}
                    </p>
                  )}

                  <div className="text-[10px] opacity-70 mt-2 text-right block w-full">
                    {m.time}
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="text-slate-500 text-sm animate-pulse ml-14">
                🤖 AI is typing…
              </div>
            )}
          </>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="flex gap-2 items-center w-full">
        <input
          disabled={!pdfId}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={
            pdfId
              ? "Ask a question about your document…"
              : "Upload a file first…"
          }
          className="
            w-full border rounded-xl px-4 py-2 text-sm
            bg-white placeholder-slate-400 text-black
            focus:ring-2 focus:ring-blue-400 focus:outline-none
          "
        />

        <button
          onClick={handleSend}
          disabled={!pdfId || !input.trim() || sending}
          className="
            px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold
            disabled:bg-blue-300 shadow-md hover:shadow-lg active:scale-95
            transition
          "
        >
          {sending ? "Thinking…" : "Send"}
        </button>
      </div>

      {/* FILE UPLOAD & CANCEL */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full pt-4 border-t mt-2">
        <label
          className="
            flex items-center justify-between gap-2
            bg-white border border-blue-300 px-4 py-2 rounded-xl
            text-blue-700 font-medium cursor-pointer shadow-sm
            hover:shadow-md transition w-full sm:w-auto
          "
        >
          <div className="flex items-center gap-2 min-w-0">
            {file ? (
              file.name.toLowerCase().endsWith(".pdf") ? (
                <BsFileEarmarkPdfFill className="text-red-500 text-lg shrink-0" />
              ) : (
                <LiaFileWordSolid className="text-blue-500 text-xl shrink-0" />
              )
            ) : (
              <BsFileEarmarkPdfFill className="text-red-400 text-lg opacity-60 shrink-0" />
            )}

            <span className="truncate block max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">
              {file ? file.name : "Choose PDF or Word file…"}
            </span>
          </div>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>

        {file && (
          <button
            onClick={cancelFileSelection}
            className="
              px-3 py-2 rounded-xl bg-red-500 text-white text-sm
              flex items-center gap-1 shadow hover:shadow-md transition
            "
          >
            <FiX /> Cancel
          </button>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="
            flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600
            text-white text-sm font-semibold disabled:bg-blue-300 shadow-md
            hover:shadow-lg active:scale-95 transition
          "
        >
          <FiUpload />
          {uploading ? "Processing…" : "Upload & Index File"}
        </button>
      </div>
    </div>
  );
}