"use client";

import { useEffect } from "react";

function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "";
  const key = "xposi_client_id";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(key, id);
  }
  return id;
}

export default function AnalyticsHeartbeat() {
  useEffect(() => {
    const clientId = getOrCreateClientId();
    if (!clientId) return;

    const sendHeartbeat = () => {
      fetch("/api/analytics/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      }).catch(() => {});
    };

    // initial ping
    sendHeartbeat();

    // ping every 30 seconds
    const id = setInterval(sendHeartbeat, 30_000);

    return () => clearInterval(id);
  }, []);

  return null;
}
