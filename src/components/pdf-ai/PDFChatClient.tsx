"use client";

import { useState, useEffect, useRef } from "react";
import { FiUpload, FiSend, FiX } from "react-icons/fi";
import { BsFileEarmarkPdfFill } from "react-icons/bs";
import { LiaFileWordSolid } from "react-icons/lia";

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

  /* Scroll on new message */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

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
          text: "📘 File uploaded and indexed! You may now ask questions.",
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

            {/* AI–PDF Animation */}
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
              Upload a PDF or Word file - XPosi AI will analyze and answer questions based strictly on its contents.
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
                    text-white text-sm font-semibold shadow
                    ${m.sender === "user" ? "bg-blue-600" : "bg-gray-700"}
                  `}
                >
                  {m.sender === "user" ? "You" : "AI"}
                </div>

                <div
                  className={`
                    max-w-[75%] px-4 py-3 rounded-2xl shadow-sm
                    ${
                      m.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-slate-200 text-slate-800"
                    }
                  `}
                >
                  {m.text}
                  <div className="text-[10px] opacity-70 mt-1 text-right">
                    {m.time}
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="text-slate-500 text-sm animate-pulse">
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
          placeholder={
            pdfId ? "Ask a question about your document…" : "Upload a file first…"
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
          "
        >
          {sending ? "Thinking…" : "Send"}
        </button>
      </div>

      {/* FILE UPLOAD (BOTTOM) */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full pt-4 border-t mt-2">

        {/* FILE PICKER */}
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

        {/* CANCEL */}
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

        {/* UPLOAD */}
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
