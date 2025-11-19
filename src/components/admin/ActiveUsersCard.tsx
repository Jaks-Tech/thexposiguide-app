"use client";

import { useEffect, useState } from "react";
import { FiUsers } from "react-icons/fi";

export default function ActiveUsersCard() {
  const [active, setActive] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchActive() {
    try {
      const res = await fetch("/api/admin/active-users");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed");
      setActive(data.activeUsers);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Unable to fetch");
    }
  }

  useEffect(() => {
    fetchActive();
    const id = setInterval(fetchActive, 5000); // refresh every 5s
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-3xl border border-blue-100 bg-white shadow-sm p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
        <FiUsers className="text-blue-600 text-xl" />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
          Active Users (Realtime)
        </span>
        {error ? (
          <span className="text-xs text-red-500 mt-1">{error}</span>
        ) : (
          <span className="text-2xl font-extrabold text-blue-700 leading-tight">
            {active === null ? "—" : active}
          </span>
        )}
        <span className="text-[11px] text-slate-400 mt-0.5">
          Counted in the last 2 minutes
        </span>
      </div>
    </div>
  );
}
