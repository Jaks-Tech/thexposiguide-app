"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RevisionVaultList, { Item } from "./RevisionVaultList";
import BreakReminder from "@/components/BreakReminder";

export default function RevisionWorkspace() {
  const [items, setItems] = useState<Item[]>([]);
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
    <div className="relative min-h-screen px-4 sm:px-6 pt-6 sm:pt-10 pb-10 sm:pb-20 overflow-x-hidden">

      
    

      {/* Subtle Background Glow */}
      {!focusMode && (
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        {!focusMode && (
          <div className="text-center mb-8 sm:mb-16">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-blue-700">
              Review Your Projections
            </h1>
            <p className="mt-3 sm:mt-5 text-gray-600 max-w-2xl mx-auto text-base sm:text-lg px-2">
              Your intelligent 24-hour projection vault. 
              Master positioning and track progress with AI guidance.
            </p>
          </div>
        )}

        {/* VAULT CONTAINER */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 font-medium">Loading vault...</p>
            </div>
          ) : (
            <RevisionVaultList
              items={items}
              refresh={() => name && fetchVault(name)}
              onFocusChange={setFocusMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}
