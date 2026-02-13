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
    } catch (e: any) {
      setMsg(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    if (loading) return;
    setProjectionName("");
    setMd("");
    setMsg(null);
  }

  const cleaned = useMemo(() => stripFrontmatter(md), [md]);

  return (
    <div className="mb-8 rounded-2xl border bg-white/50 p-4 sm:p-5">

      {/* INPUT SECTION */}
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
              {loading && (
                <motion.p
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  className="text-xs font-medium text-blue-600"
                >
                  🤖 XposiAI is generating…
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* BUTTON GROUP */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={generate}
            disabled={loading}
            className="relative h-[42px] flex-1 sm:flex-none overflow-hidden rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white disabled:opacity-70"
          >
            <span className="relative flex items-center justify-center gap-2">
              {loading ? <Spinner /> : null}
              {loading ? "Generating…" : "Generate"}
            </span>
          </button>

          <button
            onClick={clearAll}
            disabled={loading || (!projectionName && !md)}
            className="h-[42px] px-4 text-sm rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {msg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-red-600"
        >
          {msg}
        </motion.p>
      )}

      {/* RESULT PANEL */}
      <AnimatePresence>
        {md && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 rounded-2xl border bg-white shadow-lg"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">
                  Generated Projection
                </h2>
                <p className="text-xs text-gray-500">Key: {key}</p>
              </div>

              <div className="flex gap-2">
                <button
                  className="rounded-lg border px-3 py-1 text-xs hover:bg-slate-100"
                  onClick={() => navigator.clipboard.writeText(md)}
                >
                  Copy
                </button>

                <button
                  className="rounded-lg border px-3 py-1 text-xs hover:bg-slate-100 disabled:opacity-60"
                  onClick={generate}
                  disabled={loading}
                >
                  {loading ? "Refreshing…" : "Regenerate"}
                </button>
              </div>
            </div>

            {/* CONTENT (natural expansion) */}
            <div className="p-6 bg-white">
              <div className="prose prose-sm sm:prose-base max-w-none prose-ul:my-2 prose-li:my-1">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      />
                    ),
                  }}
                >
                  {cleaned}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
