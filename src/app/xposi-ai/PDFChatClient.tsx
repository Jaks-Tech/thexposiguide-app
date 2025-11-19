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
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Smooth scroll to bottom on new messages or typing
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function handleFileSelect(newFile: File | null) {
    if (!newFile) return;

    const ext = newFile.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      alert("Unsupported file type. Please upload a PDF or Word file.");
      return;
    }

    setFile(newFile);
  }

  function cancelFileSelection() {
    setFile(null);
    setPdfId(null);
    setMessages([]);
  }

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
      if (!data.success) throw new Error(data.error || "Upload failed");

      setPdfId(data.pdf_id);
      setMessages([
        {
          sender: "ai",
          text:
            "📘 Your document has been uploaded and indexed! You may now ask questions about its content.",
          time: now(),
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        {
          sender: "ai",
          text: "❌ There was a problem processing your document.",
          time: now(),
        },
      ]);
    } finally {
      setUploading(false);
    }
  }

  async function handleSend() {
    if (!pdfId || !input.trim()) return;

    const question = input.trim();
    setInput("");

    // Add user message
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

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.answer || "⚠️ No answer returned.",
          time: now(),
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "❌ Error contacting the AI assistant.",
          time: now(),
        },
      ]);
    } finally {
      setSending(false);
      setTyping(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* FILE UPLOAD BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* FILE SELECT */}
        <label
          className="
            flex items-center justify-between gap-2
            bg-white border border-blue-300 px-4 py-2 rounded-xl
            text-blue-700 font-medium cursor-pointer shadow-sm
            hover:shadow-md transition w-full sm:w-auto
          "
        >
          <div className="flex items-center gap-2">
            {file ? (
              file.name.toLowerCase().endsWith(".pdf") ? (
                <BsFileEarmarkPdfFill className="text-red-500 text-lg" />
              ) : (
                <LiaFileWordSolid className="text-blue-500 text-xl" />
              )
            ) : (
              <BsFileEarmarkPdfFill className="text-red-400 text-lg opacity-60" />
            )}

            <span className="truncate">
              {file ? file.name : "Choose PDF or Word file..."}
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
            <FiX />
            Cancel
          </button>
        )}

        {/* UPLOAD */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="
            flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600
            text-white text-sm font-semibold disabled:bg-blue-300 shadow-md
            hover:shadow-lg active:scale-[0.98] transition
          "
        >
          <FiUpload />
          {uploading ? "Processing…" : "Upload & Index File"}
        </button>
      </div>

      {/* CHAT WINDOW */}
      <div className="border rounded-4xl bg-slate-100 max-h-[70vh] min-h-[30rem] overflow-y-auto p-10 space-y-10 text-sm shadow-inner">
        {messages.length === 0 && !typing ? (
          <p className="text-slate-500 text-center mt-10">
            Upload a PDF or Word document above, then ask XPosi AI anything
            based strictly on its contents.
          </p>
        ) : (
          <>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${
                  m.sender === "user" ? "flex-row-reverse" : ""
                }`}
                            >
              {/* AVATAR */}
              <div
                className={`
                  w-12 h-12 
                  rounded-full 
                  flex items-center justify-center 
                  text-white text-base font-semibold 
                  px-2 truncate shadow
                  ${m.sender === "user" ? "bg-blue-600" : "bg-gray-700"}
                `}
              >
                {m.sender === "user" ? "You" : "XPosi AI"}
              </div>


                {/* BUBBLE */}
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                    m.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-800"
                  }`}
                >
                  {m.text}
                  {m.time && (
                    <div className="text-[10px] opacity-70 mt-1 text-right">
                      {m.time}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {typing && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold shadow">
                  AI
                </div>
                <div className="bg-white border border-slate-200 text-slate-500 px-4 py-2 rounded-2xl shadow-sm text-sm">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300" />
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            disabled={!pdfId}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              pdfId
                ? "Ask a question about your document..."
                : "Upload a file first..."
            }
            className="
              w-full border rounded-xl px-10 py-2 text-sm
              text-black placeholder-slate-400 bg-white
              focus:ring-2 focus:ring-blue-400 focus:outline-none
            "
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!pdfId || !input.trim() || sending}
          className="
            px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold
            disabled:bg-blue-300 shadow-md hover:shadow-lg transition
            active:scale-[0.97]
          "
        >
          {sending ? "Thinking…" : "Send"}
        </button>
      </div>
    </div>
  );
}
