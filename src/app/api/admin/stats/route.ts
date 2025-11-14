import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    console.log("🔥 /api/admin/stats called");

    // NOTES
    const { count: notes } = await supabaseAdmin
      .from("uploads")
      .select("*", { count: "exact", head: true })
      .eq("category", "notes");

    // PAST PAPERS (detected via storage path)
    const { count: papers } = await supabaseAdmin
      .from("uploads")
      .select("*", { count: "exact", head: true })
      .ilike("path", "papers/%");

    // MODULES (all modules EXCLUDING papers)
    const { data: moduleRows, count: rawModules } = await supabaseAdmin
      .from("uploads")
      .select("path", { count: "exact" })
      .eq("category", "module");

    const modules =
      moduleRows?.filter((row) => !row.path.startsWith("papers/")).length ?? 0;

    // ASSIGNMENTS (unchanged)
    const { count: assignments } = await supabaseAdmin
      .from("assignments")
      .select("*", { count: "exact", head: true });

    // ANNOUNCEMENTS (unchanged)
    const { count: announcements } = await supabaseAdmin
      .from("announcements")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      notes: notes ?? 0,
      papers: papers ?? 0,
      modules: modules ?? 0,
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
