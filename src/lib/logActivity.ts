import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function logActivity(action: string) {
  try {
    await fetch("/api/admin/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
  } catch (err) {
    console.error("logActivity failed:", err);
  }
}

