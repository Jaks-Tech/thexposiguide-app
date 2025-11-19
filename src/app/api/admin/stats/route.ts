import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    console.log("🔥 /api/admin/stats called");

    // 🟦 1. ACTIVE USERS IN LAST 2 MINUTES
    const activeWindow = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    const { count: activeUsers, error: activeError } = await supabaseAdmin
      .from("active_sessions")
      .select("*", { count: "exact", head: true })
      .gte("last_seen", activeWindow);

    if (activeError) {
      console.error("❌ Active user count failed:", activeError.message);
    }

    // 🟩 2. NOTES
    const { count: notes } = await supabaseAdmin
      .from("uploads")
      .select("*", { count: "exact", head: true })
      .eq("category", "notes");

    // 🟨 3. PAST PAPERS
    const { count: papers } = await supabaseAdmin
      .from("uploads")
      .select("*", { count: "exact", head: true })
      .ilike("path", "papers/%");

    // 🟧 4. MODULES (EXCLUDING PAPERS)
    const { data: moduleRows } = await supabaseAdmin
      .from("uploads")
      .select("path")
      .eq("category", "module");

    const modules =
      moduleRows?.filter((row) => !row.path.startsWith("papers/")).length ?? 0;

    // 🟥 5. ASSIGNMENTS
    const { count: assignments } = await supabaseAdmin
      .from("assignments")
      .select("*", { count: "exact", head: true });

    // 🟪 6. ANNOUNCEMENTS
    const { count: announcements } = await supabaseAdmin
      .from("announcements")
      .select("*", { count: "exact", head: true });

    // 🟩 RETURN FINAL MERGED STATS
    return NextResponse.json({
      success: true,
      activeUsers: activeUsers ?? 0,
      notes: notes ?? 0,
      papers: papers ?? 0,
      modules,
      assignments: assignments ?? 0,
      announcements: announcements ?? 0,
    });
  } catch (err: any) {
    console.error("❌ Stats failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
