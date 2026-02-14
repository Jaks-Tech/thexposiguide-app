"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RevisionVaultList, { Item } from "./RevisionVaultList";

export default function RevisionWorkspace() {
  const [items, setItems] = useState<Item[]>([]); // Using the typed Item interface
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [focusMode, setFocusMode] = useState(false);

  async function fetchVault(userName: string) {
    setLoading(true);

    const { data } = await supabase
      .from("revision_projections")
      .select("*")
      .eq("created_by", userName)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (data) setItems(data as Item[]);

    setLoading(false);
  }

  useEffect(() => {
    const stored = localStorage.getItem("rai_name") || "The RAI Expert";
    setName(stored);
    fetchVault(stored);
  }, []);

  return (
    <div className="relative min-h-screen px-6 py-20 overflow-hidden">
      {/* Neon Glow Background */}
      {!focusMode && (
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        {!focusMode && (
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold tracking-tight text-blue-700">
              Revision Workspace
            </h1>

            <p className="mt-5 text-gray-600 max-w-2xl mx-auto text-lg">
              Your intelligent 24-hour projection vault. Master positioning,
              track progress, and revise with structured AI-enhanced guidance.
            </p>
          </div>
        )}

        {/* VAULT CONTAINER (Now comes first) */}
        <div className="bg-white/70 backdrop-blur-md border rounded-3xl shadow-xl p-8 sm:p-12 mb-16">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading your revision vault...
            </div>
          ) : (
            <RevisionVaultList
              items={items}
              refresh={() => name && fetchVault(name)}
              onFocusChange={setFocusMode}
            />
          )}
        </div>

        {/* COOL REVISION FEATURES (Now moved below the vault) */}
        {!focusMode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              title="High-Yield Focus"
              desc="Prioritize the most exam-relevant positioning techniques."
              color="blue"
            />
            <FeatureCard
              title="24-Hour Smart Vault"
              desc="Temporary storage keeps your revision sharp and active."
              color="purple"
            />
            <FeatureCard
              title="Progress Tracking"
              desc="Mark projections as revised and track completion."
              color="cyan"
            />
            <FeatureCard
              title="AI Structured Output"
              desc="Exam-ready formatting with anatomy and CR precision."
              color="indigo"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* Neon Feature Card */
function FeatureCard({
  title,
  desc,
  color,
}: {
  title: string;
  desc: string;
  color: string;
}) {
  const glowMap: Record<string, string> = {
    blue: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
    purple: "shadow-[0_0_20px_rgba(168,85,247,0.5)]",
    cyan: "shadow-[0_0_20px_rgba(34,211,238,0.5)]",
    indigo: "shadow-[0_0_20_px_rgba(99,102,241,0.5)]",
  };

  return (
    <div
      className={`rounded-2xl border p-6 bg-white transition duration-300 hover:scale-[1.02] ${glowMap[color]}`}
    >
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}