"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Clipboard,
  Eraser,
  FolderOpen,
  RefreshCw,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";

type ModuleType = "upper" | "lower" | "pelvic";

type Props = {
  module: ModuleType;
};

type SuggestedProjection = {
  label: string;
  value: string;
};

const MODULE_LABELS: Record<ModuleType, string> = {
  upper: "Upper Limb",
  lower: "Lower Limb",
  pelvic: "Pelvis",
};

const SUGGESTIONS: Record<ModuleType, SuggestedProjection[]> = {
  upper: [
    { label: "AP Axial Clavicle", value: "AP Axial Clavicle" },
    { label: "Scaphoid Series", value: "Scaphoid Series" },
    { label: "Lateral Elbow", value: "Lateral Elbow" },
  ],
  lower: [
    { label: "AP Knee", value: "AP Knee" },
    { label: "Lateral Ankle", value: "Lateral Ankle" },
    { label: "Calcaneus Axial", value: "Calcaneus Axial" },
  ],
  pelvic: [
    { label: "AP Pelvis", value: "AP Pelvis" },
    { label: "Judet Views", value: "Judet Views" },
    { label: "Inlet Outlet Pelvis", value: "Inlet Outlet Pelvis" },
  ],
};

function stripFrontmatter(md: string) {
  return md.replace(/^---[\s\S]*?---\s*/m, "");
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getUserName() {
  if (typeof window === "undefined") return "The RAI Expert";
  return localStorage.getItem("rai_name") || "The RAI Expert";
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}

export default function GenerateProjectionRealtime({ module }: Props) {
  const [mounted, setMounted] = useState(false);
  const [projectionName, setProjectionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [vaultCount, setVaultCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const cleanedMarkdown = useMemo(() => stripFrontmatter(markdown), [markdown]);

  const suggestions = SUGGESTIONS[module];
  const canGenerate = projectionName.trim().length >= 3 && !loading;
  const hasResult = Boolean(markdown);

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

  async function fetchVaultCount() {
    try {
      const { count } = await supabase
        .from("revision_projections")
        .select("*", { count: "exact", head: true })
        .eq("created_by", getUserName())
        .gt("expires_at", new Date().toISOString());

      if (count !== null) setVaultCount(count);
    } catch {
      setVaultCount(0);
    }
  }

  useEffect(() => {
    fetchVaultCount();
  }, []);

  async function generate() {
    setMessage(null);
    setCopied(false);

    const name = projectionName.trim();

    if (name.length < 3) {
      setMessage("Type a longer projection name before generating.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/projections/realtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module, projectionName: name }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Generation failed.");
      }

      const generatedMarkdown = json.markdown || "";
      setMarkdown(generatedMarkdown);

      await fetch("/api/revision/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          created_by: getUserName(),
          module,
          projection_name: name,
          markdown: generatedMarkdown,
        }),
      });

      fetchVaultCount();
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, "Something went wrong."));
    } finally {
      setLoading(false);
    }
  }

  async function copyMarkdown() {
    if (!markdown) return;

    await navigator.clipboard.writeText(markdown);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  function closeFullscreen() {
    setMarkdown("");
    setCopied(false);
  }

  function clearAll() {
    if (loading) return;

    setProjectionName("");
    setMarkdown("");
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
                Projection Lesson
              </p>

              <h2 className="mt-1 truncate text-lg font-black text-white sm:text-2xl">
                {projectionName || "Generated Projection"}
              </h2>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={copyMarkdown}
                className="rounded-xl bg-white/10 p-3 text-white/70 transition hover:bg-white/20 hover:text-white"
                aria-label="Copy projection lesson"
              >
                <Clipboard size={18} />
              </button>

              <button
                type="button"
                onClick={generate}
                disabled={loading}
                className="rounded-xl bg-white/10 p-3 text-white/70 transition hover:bg-white/20 hover:text-white disabled:opacity-50"
                aria-label="Regenerate projection lesson"
              >
                <RefreshCw size={18} />
              </button>

              <button
                type="button"
                onClick={closeFullscreen}
                className="rounded-xl bg-red-500/20 p-3 text-red-300 transition hover:bg-red-500/30 hover:text-white"
                aria-label="Close fullscreen"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Hero */}
          <section className="w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-10 sm:px-8 sm:py-14">
            <div className="mx-auto max-w-5xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">
                <Sparkles size={13} />
                {MODULE_LABELS[module]} Module
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-6xl">
                {projectionName}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                Structured radiographic projection notes including positioning,
                anatomy landmarks, image criteria, central ray, and exposure
                guidance.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-white/70">
                  Saved to 24h vault
                </span>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-300">
                  XposiAI generated
                </span>

                {copied && (
                  <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-bold text-blue-300">
                    Copied
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Lesson Content */}
          <section className="w-screen bg-white px-4 py-8 sm:px-8 sm:py-12">
            <div className="mx-auto max-w-5xl">
              <div className="mb-8 border-b border-slate-200 pb-5">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                  Generated Result
                </p>

                <h3 className="mt-1 text-2xl font-black text-slate-950">
                  Projection Lesson Notes
                </h3>
              </div>

              <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-950 prose-h2:text-blue-700 prose-h3:text-blue-600 prose-p:leading-7 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-950 prose-table:text-sm prose-th:bg-slate-50 prose-th:p-3 prose-td:p-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {cleanedMarkdown || "No lesson returned."}
                </ReactMarkdown>
              </div>

              <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex flex-col gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {copied ? "Copied lesson" : "Projection Studio Output"}
                  </span>

                  <span className="inline-flex items-center gap-2 text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Saved in vault
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
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-cyan-100 blur-3xl" />

        <div className="relative p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                <Sparkles size={13} />
                {MODULE_LABELS[module]} Module
              </div>

              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Projection Lesson Generator
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Create structured radiographic projection notes with positioning,
                anatomy landmarks, image criteria, and exposure guidance.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-black text-blue-900">
                <FolderOpen size={17} />
                {vaultCount}
              </div>
              <p className="mt-1 text-[11px] font-medium text-blue-700">
                saved in 24h vault
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <label className="block text-sm font-bold text-slate-900">
              What projection do you want to generate?
            </label>

            <div className="mt-3 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">


                <input
                  value={projectionName}
                  onChange={(event) => setProjectionName(event.target.value)}
                  placeholder='e.g. "AP Axial Clavicle"'
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") generate();
                  }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={generate}
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
                      Generate
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={clearAll}
                  disabled={loading || (!projectionName && !markdown)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Eraser size={16} />
                  Clear
                </button>
              </div>
            </div>

            {/* Suggestions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setProjectionName(item.value)}
                  disabled={loading}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]" />
                <p className="text-xs font-semibold text-slate-600">
                  AI-generated notes are stored for 24 hours.
                </p>
              </div>

              <Link
                href="/revision-workspace"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white transition hover:bg-slate-800"
              >
                Revise Vault
                <ArrowRight size={14} />
              </Link>
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
                Generating your fullscreen projection lesson...
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