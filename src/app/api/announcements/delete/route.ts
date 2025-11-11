import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Delete an announcement manually (Admin only)
 * Expects JSON: { id: "uuid" }
 */
export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing announcement ID" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ Error deleting announcement:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "✅ Announcement deleted" });
  } catch (err: any) {
    console.error("❌ Delete error:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}
