"use client";

import { useEffect, useState } from "react";

export default function ActiveUsersBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchActive() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();

        if (data.success && typeof data.activeUsers === "number") {
          setCount(data.activeUsers);
        }
      } catch (err) {
        console.error("Failed to fetch active users:", err);
      }
    }

    fetchActive();
    const interval = setInterval(fetchActive, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
      Active: {count ?? "…"}
    </span>
  );
}
