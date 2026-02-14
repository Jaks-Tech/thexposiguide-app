"use client";

import { useMemo, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

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
  const [vaultCount, setVaultCount] = useState(0);

  const key = useMemo(
    () => slugify(`${module}-${projectionName}`),
    [module, projectionName]
  );

  async function fetchVaultCount() {
    const name = localStorage.getItem("rai_name") || "The RAI Expert";
    const { count } = await supabase
      .from("revision_projections")
      .select("*", { count: "exact", head: true })
      .eq("created_by", name)
      .gt("expires_at", new Date().toISOString());

    if (count !== null) setVaultCount(count);
  }

  useEffect(() => {
    fetchVaultCount();
  }, []);

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

      await fetch("/api/revision/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          created_by: localStorage.getItem("rai_name") || "The RAI Expert",
          module,
          projection_name: name,
          markdown: json.markdown,
        }),
      });

      fetchVaultCount();
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
    <div className="mb-8 rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
      
      {/* INPUT SECTION */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            Need a projection that’s not listed?
          </label>
          
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={projectionName}
              onChange={(e) => setProjectionName(e.target.value)}
              placeholder='e.g., "AP Axial Clavicle"'
              className="h-[44px] flex-1 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter") generate();
              }}
            />

            <div className="flex gap-2">
              <button
                onClick={generate}
                disabled={loading}
                className="h-[44px] flex-1 sm:flex-none sm:px-6 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md active:scale-95 transition-all disabled:opacity-70"
              >
                {loading ? <div className="flex items-center gap-2 justify-center"><Spinner /><span>Wait...</span></div> : "Generate"}
              </button>

              <button
                onClick={clearAll}
                disabled={loading || (!projectionName && !md)}
                className="h-[44px] px-4 text-sm font-medium rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-[11px] sm:text-xs text-gray-500 leading-tight">
              AI-generated and stored in your vault for 24h.
            </p>
            <AnimatePresence>
              {loading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] sm:text-xs font-bold text-blue-600 animate-pulse"
                >
                  🤖 Generating...
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* VAULT BANNER - Optimized for Mobile */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl bg-blue-50 border border-blue-100 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-medium text-blue-900">
              Vault: <span className="font-bold">{vaultCount}</span> Projections
            </span>
          </div>

          <Link
            href="/revision-workspace"
            className="w-full sm:w-auto text-center text-xs font-bold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
          >
            Open Revision Workspace →
          </Link>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {msg && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-xs font-medium text-red-500 bg-red-50 p-2 rounded-lg border border-red-100"
        >
          ⚠️ {msg}
        </motion.p>
      )}

      {/* RESULT PANEL */}
      <AnimatePresence>
        {md && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b bg-gray-50 gap-2">
              <div className="overflow-hidden">
                <h2 className="text-xs font-bold text-gray-900 truncate uppercase tracking-wider">
                  {projectionName || "Result"}
                </h2>
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 sm:flex-none rounded-lg border border-gray-200 px-3 py-1.5 text-[10px] font-bold uppercase bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => navigator.clipboard.writeText(md)}
                >
                  Copy
                </button>
                <button
                  className="flex-1 sm:flex-none rounded-lg border border-gray-200 px-3 py-1.5 text-[10px] font-bold uppercase bg-white hover:bg-gray-50 disabled:opacity-60 transition-colors"
                  onClick={generate}
                  disabled={loading}
                >
                  Regen
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-x-auto">
              <div className="prose prose-blue prose-sm max-w-none prose-headings:text-blue-900 prose-li:text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
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