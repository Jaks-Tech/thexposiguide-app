"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Clipboard,
  Download,
  Eraser,
  Image as ImageIcon,
  RefreshCw,
  Sparkles,
  WandSparkles,
} from "lucide-react";

type VisualResponse = {
  image?: string;
  mimeType?: string;
  planMarkdown?: string;
  error?: string;
};

const SUGGESTIONS = [
  "Lateral Knee",
  "PA Chest",
  "AP Pelvis",
  "Odontoid View",
  "AP Axial Clavicle",
  "Lateral C-Spine",
];

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function createCaseRef() {
  return `XP-${Math.floor(Math.random() * 9000) + 1000}`;
}

export default function ProjectionVisualCreator() {
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [visualTopic, setVisualTopic] = useState("");
  const [planMarkdown, setPlanMarkdown] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const hasResult = Boolean(imageSrc);
  const canGenerate = prompt.trim().length >= 3 && !loading;
  const caseRef = useMemo(() => createCaseRef(), [imageSrc]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!hasResult) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [hasResult]);

  async function createVisual() {
    setMessage(null);
    setCopied(false);

    const study = prompt.trim();

    if (study.length < 3) {
      setMessage("Please enter a specific projection or anatomy.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/projections/visuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ study }),
      });

      const json = (await res.json()) as VisualResponse;

      if (!res.ok) {
        throw new Error(json?.error || "Visual generation failed.");
      }

      if (!json.image) {
        throw new Error("The server did not return an image.");
      }

      setImageSrc(`data:${json.mimeType || "image/png"};base64,${json.image}`);
      setVisualTopic(study);
      setPlanMarkdown(json.planMarkdown || "");
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, "Could not create visual."));
    } finally {
      setLoading(false);
    }
  }

  async function copyBlueprint() {
    if (!planMarkdown) return;

    await navigator.clipboard.writeText(planMarkdown);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  function downloadImage() {
    if (!imageSrc) return;

    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = `${visualTopic || "projection-visual"}.png`;
    link.click();
  }

  function closeFullscreen() {
    setImageSrc("");
    setVisualTopic("");
    setPlanMarkdown("");
    setCopied(false);
  }

  function clearAll() {
    if (loading) return;

    setPrompt("");
    setImageSrc("");
    setVisualTopic("");
    setPlanMarkdown("");
    setMessage(null);
    setCopied(false);
  }

  const fullscreenResult =
    mounted &&
    hasResult &&
    createPortal(
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] h-[100dvh] w-screen overflow-y-auto bg-slate-950"
        >
          {/* Top Bar */}
          <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 py-4 backdrop-blur-xl sm:px-6">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-400">
                Radiographic Visualization
              </p>
              <h2 className="mt-1 truncate text-lg font-black text-white sm:text-2xl">
                {visualTopic}
              </h2>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={downloadImage}
                className="rounded-xl bg-white/10 p-3 text-white/70 transition hover:bg-white/20 hover:text-white"
                aria-label="Download visual"
              >
                <Download size={18} />
              </button>

              <button
                type="button"
                onClick={createVisual}
                disabled={loading}
                className="rounded-xl bg-white/10 p-3 text-white/70 transition hover:bg-white/20 hover:text-white disabled:opacity-50"
                aria-label="Regenerate visual"
              >
                <RefreshCw size={18} />
              </button>

              <button
                type="button"
                onClick={closeFullscreen}
                className="rounded-xl bg-red-500/20 p-3 text-red-300 transition hover:bg-red-500/30 hover:text-white"
                aria-label="Close fullscreen"
              >
                <Eraser size={18} />
              </button>
            </div>
          </div>

          {/* Visual on Top */}
          <section className="flex min-h-[72dvh] w-screen items-center justify-center bg-black px-3 py-5 sm:px-6">
            <div className="relative h-[68dvh] w-full max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
              <Image
                src={imageSrc}
                alt={visualTopic}
                fill
                unoptimized
                priority
                className="object-contain"
              />
            </div>
          </section>

          {/* Explanation Below */}
          <section className="w-screen bg-white px-4 py-8 sm:px-8 sm:py-10">
            <div className="mx-auto max-w-5xl">
              <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Positioning Blueprint
                  </p>

                  <h3 className="mt-1 text-2xl font-black text-slate-950">
                    {visualTopic}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={copyBlueprint}
                  disabled={!planMarkdown}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                  aria-label="Copy blueprint"
                >
                  <Clipboard size={18} />
                </button>
              </div>

              <div className="prose prose-slate max-w-none prose-headings:font-black prose-h2:text-blue-700 prose-h3:text-blue-600 prose-h3:uppercase prose-h3:tracking-widest prose-p:leading-7 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-950">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {planMarkdown || "No blueprint returned."}
                </ReactMarkdown>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <span>{copied ? "Copied blueprint" : caseRef}</span>

                  <span className="inline-flex items-center gap-2 text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    XposiAI Generated
                  </span>
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      </AnimatePresence>,
      document.body
    );

  return (
    <>
      <section className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
        <div className="absolute left-0 top-0 h-44 w-44 rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-cyan-100 blur-3xl" />

        <div className="relative p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-blue-700">
                <ImageIcon size={13} />
                Visual Study Tool
              </div>

              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Projection Visual Creator
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Generate positioning visuals with a companion blueprint for
                anatomy, centering, patient position, and image-quality checks.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Output Mode
              </p>
              <p className="mt-1 text-sm font-black text-slate-900">
                Fullscreen
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <label className="block text-sm font-bold text-slate-900">
              What visual should XPosi AI create?
            </label>

            <div className="mt-3 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">


                <input
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder='e.g. "Lateral C-Spine"'
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") createVisual();
                  }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={createVisual}
                  disabled={!canGenerate}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 lg:flex-none"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Generating
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={clearAll}
                  disabled={loading || !prompt}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Eraser size={16} />
                  Clear
                </button>
              </div>
            </div>


          </div>

          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700"
              >
                Creating fullscreen visual and positioning blueprint...
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
              >
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {fullscreenResult}
    </>
  );
}