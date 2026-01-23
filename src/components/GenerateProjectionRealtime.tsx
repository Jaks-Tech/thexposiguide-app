"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AnimatePresence, motion } from "framer-motion";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function stripFrontmatter(md: string) {
  return md.replace(/^---[\s\S]*?---\s*/m, "");
}

type Props = { module: "upper" | "lower" | "pelvic" };

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}

export default function GenerateProjectionRealtime({ module }: Props) {
  const [projectionName, setProjectionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [md, setMd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const key = useMemo(
    () => slugify(`${module}-${projectionName}`),
    [module, projectionName]
  );

  async function generate() {
    setMsg(null);

    const name = projectionName.trim();
    if (name.length < 3) {
      setMsg("Type a longer projection name.");
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
      if (!res.ok) throw new Error(json?.error || "Generation failed.");

      setMd(json.markdown || "");
      setOpen(true);
    } catch (e: any) {
      setMsg(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const cleaned = useMemo(() => stripFrontmatter(md), [md]);

  return (
    <div className="mb-8 rounded-2xl border bg-white/50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">
            Need a projection that’s not listed?
          </label>

          <input
            value={projectionName}
            onChange={(e) => setProjectionName(e.target.value)}
            placeholder='e.g., "AP Axial Clavicle"'
            className="mt-1 h-[42px] w-full rounded-xl border px-3 text-sm outline-none focus:ring"
            onKeyDown={(e) => {
              if (e.key === "Enter") generate();
            }}
          />

          <div className="mt-1 flex items-center gap-2">
            <p className="text-xs text-gray-500">
              Generated on demand and cached temporarily (expires in ~24 hours).
            </p>

            <AnimatePresence>
              {loading ? (
                <motion.p
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  className="text-xs font-medium text-blue-600"
                >
                  🤖 XposiAI is generating…
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="relative h-[42px] w-full sm:w-auto overflow-hidden rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white disabled:opacity-70"
        >
          {/* shimmer */}
          <span
            className={`pointer-events-none absolute inset-0 opacity-0 ${
              loading ? "opacity-100" : ""
            }`}
          >
            <span className="absolute inset-0 animate-pulse bg-white/10" />
          </span>

          <span className="relative flex items-center justify-center gap-2">
            {loading ? <Spinner /> : null}
            {loading ? "Generating…" : "Generate"}
          </span>
        </button>
      </div>

      {msg ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-red-600"
        >
          {msg}
        </motion.p>
      ) : null}

      {/* Modal */}
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel */}
            <motion.div
              className="relative w-full max-w-3xl rounded-2xl bg-white p-4 sm:p-6 shadow-xl"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Generated Projection</h2>
                  <p className="text-xs text-gray-500">Key: {key}</p>
                </div>
                <button
                  className="rounded-lg border px-3 py-1 text-sm"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>

              <div className="mt-4 max-h-[70vh] overflow-auto rounded-xl border bg-white p-4">
                <div className="prose prose-sm sm:prose-base max-w-none prose-ul:my-2 prose-li:my-1">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {cleaned}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="rounded-xl border px-4 py-2 text-sm"
                  onClick={() => navigator.clipboard.writeText(md)}
                >
                  Copy markdown
                </button>
                <button
                  className="rounded-xl border px-4 py-2 text-sm disabled:opacity-60"
                  onClick={generate}
                  disabled={loading}
                >
                  {loading ? "Refreshing…" : "Show again"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
