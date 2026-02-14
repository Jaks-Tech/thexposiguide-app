"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export type Item = {
  id: string;
  projection_name: string;
  markdown: string;
  is_revised: boolean;
};

interface RevisionVaultListProps {
  items: Item[];
  refresh: () => void;
  onFocusChange: (isFocusing: boolean) => void;
}

export default function RevisionVaultList({
  items,
  refresh,
  onFocusChange,
}: RevisionVaultListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    onFocusChange(!!expandedId);
  }, [expandedId, onFocusChange]);

  async function markRevised(id: string, value: boolean) {
    await supabase
      .from("revision_projections")
      .update({ is_revised: value })
      .eq("id", id);
    refresh();
  }

  async function deleteItem(id: string) {
    const { error } = await supabase
      .from("revision_projections")
      .delete()
      .eq("id", id);
    
    if (!error) refresh();
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (expandedId) {
    const item = items.find((i) => i.id === expandedId);
    if (!item) return null;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="focus"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-blue-700">Focus Mode</h1>
            <p className="mt-3 text-gray-600">Distraction-free revision.</p>
          </div>

          <div className="rounded-3xl border bg-white shadow-2xl p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-3xl font-semibold text-gray-800">
                {item.projection_name}
              </h2>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => markRevised(item.id, !item.is_revised)}
                  className="text-sm border px-4 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  {item.is_revised ? "Undo" : "Mark Revised"}
                </button>
                <button
                  onClick={() => {
                    deleteItem(item.id);
                    setExpandedId(null);
                  }}
                  className="text-sm border border-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition"
                >
                  Delete
                </button>
                <button
                  onClick={() => setExpandedId(null)}
                  className="text-sm px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="prose prose-blue prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.markdown}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="relative">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-700">Projections List</h1>
        <p className="mt-3 text-gray-600 max-w-xl mx-auto">
          Select a projection to enter focus mode and revise in depth.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {items.map((item) => {
            const preview =
              item.markdown.replace(/[#>*`-]/g, "").slice(0, 160) + "...";

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex flex-col rounded-2xl border bg-white p-6 shadow-md transition hover:shadow-xl ${
                  item.is_revised ? "opacity-75 grayscale-[0.5]" : ""
                }`}
              >
                <div className="flex-1">
                  <h2 className={`text-lg font-semibold mb-3 ${item.is_revised ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {item.projection_name}
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed">
                    {preview}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-gray-50">
                  <button
                    onClick={() => markRevised(item.id, !item.is_revised)}
                    className="text-[11px] font-bold uppercase tracking-wider border px-2 py-1.5 rounded hover:bg-slate-50 transition"
                  >
                    {item.is_revised ? "Undo" : "Revised"}
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-[11px] font-bold uppercase tracking-wider border border-red-50 text-red-500 px-2 py-1.5 rounded hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition ml-auto"
                  >
                    Open
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

/* ===============================
    FANCY EMPTY STATE COMPONENT
=============================== */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 overflow-hidden">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Animated Radar Rings */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          className="absolute inset-0 border-2 border-blue-400 rounded-full"
        />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeOut" }}
          className="absolute inset-0 border-2 border-purple-400 rounded-full"
        />
        
        {/* Central Glowing Icon/Orb */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="relative z-10 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center"
        >
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </motion.div>

        {/* Floating "Particles" */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -20, 0],
              x: [0, i % 2 === 0 ? 15 : -15, 0],
              opacity: [0.2, 0.8, 0.2] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3 + i, 
              delay: i * 0.2 
            }}
            className="absolute w-2 h-2 bg-blue-400 rounded-full blur-[1px]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8"
      >
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Vault Primed & Ready
        </h3>
        <p className="mt-2 text-gray-500 font-medium">
          Waiting for your next intelligent projection...
        </p>
      </motion.div>
    </div>
  );
}