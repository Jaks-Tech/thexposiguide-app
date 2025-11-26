"use client";

import { useState, useEffect, useRef } from "react";
import { FiUpload, FiSend, FiX, FiPaperclip, FiXCircle } from "react-icons/fi";
import { BsFileEarmarkPdfFill } from "react-icons/bs";
import { LiaFileWordSolid } from "react-icons/lia";
import { PiPushPinBold, PiPushPinSlashBold } from "react-icons/pi";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EmojiPicker from "emoji-picker-react";
import DisableAutoScroll from "@/components/DisableAutoScrollXposiAI";
type ChatMessage = {
  id: string;
  sender: "user" | "ai";
  text: string;
  time?: string;
  pinned?: boolean;
  attachmentUrl?: string;
  streaming?: boolean;
};

export default function PDFChatClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfId, setPdfId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Emoji picker
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiRef = useRef<HTMLDivElement | null>(null);

  // Voice input
  const [hasSpeech, setHasSpeech] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Pinned sidebar
  const [pinnedOpen, setPinnedOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);   
  const [autoScroll, setAutoScroll] = useState(true);   
  const allowedExtensions = ["pdf", "doc", "docx"];

  const now = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  /* ---------------- SCROLL ---------------- */
useEffect(() => {
  if (isStreaming) return;   // 👈 do NOT scroll while typing
  chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, isStreaming]);


  /* ---------------- EMOJI CLICK-OUTSIDE ---------------- */
  useEffect(() => {
    if (!emojiOpen) return;

    function handleClick(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [emojiOpen]);

  /* ---------------- VOICE SETUP ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      setHasSpeech(false);
      return;
    }

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event: any) => {
      setInput((prev) => prev + " " + event.results[0][0].transcript);
    };

    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    setHasSpeech(true);
  }, []);

  function handleToggleListening() {
    if (!hasSpeech) {
      alert("Voice input not supported");
      return;
    }
    if (listening) return recognitionRef.current.stop();

    setListening(true);
    recognitionRef.current.start();
  }

  /* ---------------- FILE SELECT ---------------- */
/* ---------------- FILE SELECT ---------------- */
async function handleFileSelect(newFile: File | null) {
  if (!newFile) return;
  const ext = newFile.name.split(".").pop()?.toLowerCase();

  if (!ext || !allowedExtensions.includes(ext)) {
    alert("Unsupported file type.");
    return;
  }

  if (previewUrl) URL.revokeObjectURL(previewUrl);

  setFile(newFile);
  setMessages([]);
  setPdfId(null);

  // Reset previews
  setPreviewExpanded(false);
  setDocxHtml(null);

  // PDF PREVIEW
  if (ext === "pdf") {
    const url = URL.createObjectURL(newFile);
    setPreviewUrl(url);
    return;
  }

  // DOCX PREVIEW — Convert to HTML
  if (ext === "docx") {
    const arrayBuffer = await newFile.arrayBuffer();
    const mammoth = await import("mammoth");

    const { value } = await mammoth.convertToHtml({
      arrayBuffer,
    });

    setDocxHtml(value);
    return;
  }

  // No preview for .doc
  setPreviewUrl(null);
}


  function cancelFileSelection() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setPdfId(null);
    setMessages([]);
  }

  /* ---------------- UPLOAD ---------------- */
  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setMessages([]);
    setPdfId(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/xposi-ai/upload-pdf", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!data.success) throw new Error();

      setPdfId(data.pdf_id);
      setMessages([
        {
          id: `sys-${Date.now()}`,
          sender: "ai",
          text: "📘 File uploaded! Ask anything.",
          time: now(),
        },
      ]);
    } catch {
      setMessages([
        {
          id: `sys-${Date.now()}`,
          sender: "ai",
          text: "❌ Upload failed.",
          time: now(),
        },
      ]);
    } finally {
      setUploading(false);
    }
  }

  /* ---------------- COPY ---------------- */
  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      alert("Can't copy");
    }
  }

  /* ---------------- PINNING ---------------- */
  function togglePin(id: string) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m))
    );
  }

  const pinnedMessages = messages.filter((m) => m.pinned);

  /* ---------------- ATTACHMENT ---------------- */
  function handleAttachment(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    const url = URL.createObjectURL(f);
    setMessages((prev) => [
      ...prev,
      {
        id: `att-${Date.now()}`,
        sender: "user",
        text: "",
        time: now(),
        attachmentUrl: url,
      },
    ]);
  }

  /* ---------------- SEND ---------------- */
  function handleKeyDown(e: any) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleSend() {
    if (!pdfId || !input.trim()) return;

    const question = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id: `us-${Date.now()}`, sender: "user", text: question, time: now() },
    ]);

    setSending(true);
    setTyping(true);

    try {
      const res = await fetch("/api/xposi-ai/pdf-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdf_id: pdfId,
          question,
          history: messages,
        }),
      });

      const data = await res.json();
      const full = data.answer || "⚠️ No response.";
      await animateTyping(full);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: "❌ AI failed",
          time: now(),
        },
      ]);
    } finally {
      setSending(false);
      setTyping(false);
    }
  }

  /* ---------------- TYPING ANIMATION ---------------- */
async function animateTyping(text: string) {
  const id = `ai-${Date.now()}`;

  setIsStreaming(true); // 👈 AI started typing

  setMessages((prev) => [
    ...prev,
    { id, sender: "ai", text: "", streaming: true }
  ]);

  let cur = "";

  for (let i = 0; i < text.length; i++) {
    cur += text[i];

    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, text: cur } : m))
    );

    await new Promise((r) => setTimeout(r, 10));
  }

  setMessages((prev) =>
    prev.map((m) =>
      m.id === id ? { ...m, text: cur, streaming: false, time: now() } : m
    )
  );

  setIsStreaming(false); // 👈 AI finished typing
}

  /* ---------------- EMOJI ---------------- */
  function handleEmojiClick(emojiData: any) {
    setInput((prev) => prev + emojiData.emoji);
  }

  /* ---------------- RENDER ---------------- */

  return (
    <>
    <DisableAutoScroll />
        <div className="relative flex flex-col gap-4 w-full max-w-3xl mx-auto px-2 py-4">
      {/* PINNED SIDEBAR */}
      {pinnedOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setPinnedOpen(false)}
          />
          <div className="w-72 sm:w-80 h-full bg-white shadow-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PiPushPinBold />
                <span className="font-semibold text-sm">Pinned</span>
              </div>
              <button
                onClick={() => setPinnedOpen(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                <FiXCircle />
              </button>
            </div>

            {pinnedMessages.length === 0 ? (
              <p className="text-xs text-slate-500">No pinned messages.</p>
            ) : (
              <div className="space-y-3 overflow-y-auto text-xs">
                {pinnedMessages.map((m) => (
                  <div
                    key={m.id}
                    className="border border-slate-200 rounded-lg p-2 bg-slate-50"
                  >
                    <div className="text-[10px] mb-1 opacity-70">
                      {m.sender === "user" ? "You" : "AI"} · {m.time}
                    </div>
                    <div className="line-clamp-4">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.text || "*Attachment*"}
                      </ReactMarkdown>
                    </div>
                    <button
                      onClick={() => togglePin(m.id)}
                      className="mt-1 text-[10px] text-red-500 hover:underline"
                    >
                      Unpin
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHAT BOX */}
      <div className="border rounded-3xl bg-white max-h-[70vh] min-h-[28rem] overflow-y-auto p-6 space-y-6 shadow-inner">
        {/* PINNED TOGGLE */}
        {file && (
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-60">
              Chatting with: <strong>{file?.name}</strong>
            </span>

            <button
              onClick={() => setPinnedOpen(true)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              <PiPushPinBold className="text-sm" />
              Pinned
              {pinnedMessages.length > 0 && `(${pinnedMessages.length})`}
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!file && messages.length === 0 && (
          <div className="text-center mt-8">
            <div className="text-6xl animate-pulse">🤖</div>
            <div className="text-5xl">📄</div>
            <h3 className="mt-4 text-xl font-bold text-blue-700">
              Scan • Read • Explain
            </h3>
            <p className="max-w-md mx-auto text-slate-700 mt-2">
              Upload a PDF or Word file to begin chatting with the document.
            </p>
          </div>
        )}

        {/* CHAT MESSAGES */}
        {file &&
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center 
                  text-white text-lg shadow
                  ${
                    m.sender === "user"
                      ? "bg-blue-600"
                      : "bg-gray-600"
                  }
                `}
              >
                {m.sender === "user" ? "🧑" : "🤖"}
              </div>

              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl shadow border
                  ${
                    m.sender === "user"
                      ? "bg-blue-200 border-blue-300"
                      : "bg-gray-100 border-slate-300"
                  }
                `}
              >
                {/* Pin button */}
                <button
                  onClick={() => togglePin(m.id)}
                  className="float-right text-xs opacity-70 hover:opacity-100"
                >
                  {m.pinned ? <PiPushPinBold /> : <PiPushPinSlashBold />}
                </button>

                {/* Attachments */}
                {m.attachmentUrl && (
                  <img
                    src={m.attachmentUrl}
                    className="rounded-lg mb-2 max-w-xs border"
                  />
                )}

                {/* Copy button */}
                {m.sender === "ai" && (
                  <div className="flex justify-end mb-1">
                    <button
                      onClick={() => handleCopy(m.text)}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-200"
                    >
                      Copy
                    </button>
                  </div>
                )}

                {/* Markdown */}
                <div
                  className="
                    prose prose-sm max-w-none
                    prose-ul:list-disc prose-ul:ml-5
                    prose-ol:list-decimal prose-ol:ml-5
                  "
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.text || "*Attachment*"}
                  </ReactMarkdown>
                </div>

                {/* Time */}
                {m.time && (
                  <div className="text-[10px] opacity-70 mt-1 text-right">
                    {m.time}
                  </div>
                )}
              </div>
            </div>
          ))}

        {typing && (
          <div className="text-slate-500 text-sm animate-pulse">
            🤖 typing…
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* EMOJI POPUP */}
      {emojiOpen && (
        <div
          ref={emojiRef}
          className="absolute bottom-28 right-3 z-20 bg-white shadow-lg rounded-xl"
        >
          <EmojiPicker onEmojiClick={(emoji) => handleEmojiClick(emoji)} />
        </div>
      )}

      {/* INPUT BAR */}
      <div className="flex gap-2 items-end w-full">
        <textarea
          disabled={!pdfId}
          value={input}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setInput(e.target.value);
            const ta = e.target;
            ta.style.height = "auto";
            ta.style.height = ta.scrollHeight + "px";
          }}
          placeholder={
            pdfId ? "Ask a question…" : "Upload a file first…"
          }
          rows={1}
          className="w-full border rounded-xl px-3 py-2 text-sm bg-white placeholder-slate-400 resize-none overflow-hidden max-h-40 outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Emoji */}
        <button
          onClick={() => setEmojiOpen((p) => !p)}
          className="px-2 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-200"
        >
          😀
        </button>

        {/* Attach */}
        <label className="px-2 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-200 cursor-pointer">
          <FiPaperclip />
          <input type="file" onChange={handleAttachment} className="hidden" />
        </label>

        {/* Voice */}
        <button
          onClick={handleToggleListening}
          disabled={!hasSpeech || !pdfId}
          className="px-2 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-200 disabled:opacity-40"
        >
          {listening ? "🎙️" : "🎤"}
        </button>

        {/* SEND */}
        <button
          onClick={handleSend}
          disabled={!pdfId || !input.trim() || sending}
          className="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:bg-blue-300"
        >
          {sending ? "…" : "Send"}
        </button>
      </div>

      {/* FILE UPLOAD BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full pt-4 border-t mt-2">
        <label className="flex items-center gap-2 bg-white border border-blue-300 px-4 py-2 rounded-xl text-blue-700 cursor-pointer shadow-sm hover:shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            {file ? (
              file.name.toLowerCase().endsWith(".pdf") ? (
                <BsFileEarmarkPdfFill className="text-red-500 text-lg" />
              ) : (
                <LiaFileWordSolid className="text-blue-500 text-xl" />
              )
            ) : (
              <BsFileEarmarkPdfFill className="text-red-400 text-lg opacity-60" />
            )}

            <span className="truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">
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

        {file && (
          <button
            onClick={cancelFileSelection}
            className="px-3 py-2 rounded-xl bg-red-500 text-white text-sm shadow hover:shadow-md flex gap-1 items-center"
          >
            <FiX /> Cancel
          </button>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow hover:shadow-lg disabled:bg-blue-300 flex items-center gap-2"
        >
          <FiUpload />
          {uploading ? "Processing…" : "Upload & Index File"}
        </button>
      </div>

      {/* UNIVERSAL PREVIEW (PDF + DOCX) */}
      {(previewUrl || docxHtml) && (
        <div className="mt-3 w-full">
          {/* Toggle Button */}
          <button
            onClick={() => setPreviewExpanded((prev) => !prev)}
            className="
              w-full flex items-center justify-between
              px-4 py-2 rounded-xl
              bg-blue-50 text-blue-700 font-medium
              border border-blue-300
              shadow-sm hover:bg-blue-100
              transition
            "
          >
            <span>📄 {previewExpanded ? "Hide Your Document" : "Preview Your Document"}</span>
            <span>{previewExpanded ? "▲" : "▼"}</span>
          </button>

          {/* Collapsible Preview */}
          {previewExpanded && (
            <div className="mt-2 w-full h-[60vh] border rounded-xl overflow-auto bg-white shadow p-4">
              
              {/* PDF PREVIEW */}
              {previewUrl && (
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title="PDF preview"
                />
              )}

              {/* DOCX PREVIEW */}
              {docxHtml && (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: docxHtml }}
                />
              )}
            </div>
          )}
        </div>
      )}

    </div>
     </>
  );
}
