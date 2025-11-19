import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { clientId } = await req.json();

    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing clientId" },
        { status: 400 }
      );
    }

    // Upsert session with fresh last_seen
    const { error } = await supabaseAdmin
      .from("active_sessions")
      .upsert(
        { client_id: clientId, last_seen: new Date().toISOString() },
        { onConflict: "client_id" }
      );

    if (error) {
      console.error("❌ Heartbeat upsert failed:", error.message);
      return NextResponse.json(
        { success: false, error: "DB error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Heartbeat error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
