"use client";

import { useState, useEffect } from "react";

export default function RevisionForm({
  onLoad,
}: {
  onLoad: (name: string) => void;
}) {
  const [name, setName] = useState("The RAI Expert");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("rai_name");
    if (stored) {
      setName(stored);
    }
    setMounted(true);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("rai_name", name);
    onLoad(name);
  }

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-10 border rounded-2xl p-6 bg-white shadow-sm"
    >
      <label className="block text-sm font-medium mb-2">
        Revision Name
      </label>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded-xl px-4 py-2 mb-4"
      />

      <button className="bg-blue-600 text-white px-5 py-2 rounded-xl">
        Load My Vault
      </button>
    </form>
  );
}
