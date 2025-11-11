import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Fetch active & upcoming announcements.
 * Automatically refreshes recurring ones and deletes expired ones.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeUpcoming = searchParams.get("includeUpcoming") === "true";

    // 🕒 Get current UTC timestamp (adjusted for local system time)
    const now = new Date();
    const nowUtcIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

    console.log("🌍 UTC Now:", nowUtcIso);

    // 🔄 NEW: Refresh recurring announcements before filtering
    try {
      const refreshUrl = `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/api/announcements/refresh`;

      await fetch(refreshUrl);
      console.log("♻️ Refreshed recurring announcements before filtering");
    } catch (refreshErr) {
      console.warn("⚠️ Failed to refresh recurring announcements:", refreshErr);
    }

    // 1️⃣ Fetch all announcements
    const { data, error } = await supabaseAdmin
      .from("announcements")
      .select("*")
      .order("start_time", { ascending: false });

    if (error) {
      console.error("❌ Supabase fetch error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const active: any[] = [];
    const upcoming: any[] = [];
    const expiredIds: string[] = [];

    const nowTime = new Date(nowUtcIso).getTime();

    // 2️⃣ Separate active, upcoming, and expired
    for (const a of data || []) {
      const start = new Date(a.start_time).getTime();
      const end = new Date(a.end_time).getTime();

      if (start <= nowTime && nowTime <= end) active.push(a);
      else if (start > nowTime) upcoming.push(a);
      else expiredIds.push(a.id);
    }

    // 3️⃣ Delete expired announcements automatically
    if (expiredIds.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from("announcements")
        .delete()
        .in("id", expiredIds);

      if (deleteError) {
        console.warn("⚠️ Failed to auto-delete expired:", deleteError.message);
      } else {
        console.log(`🧹 Auto-deleted ${expiredIds.length} expired announcement(s)`);
      }
    }

    // 4️⃣ Return active & upcoming
    return NextResponse.json({
      timestamp: nowUtcIso,
      active,
      upcoming: includeUpcoming ? upcoming : [],
    });
  } catch (err: any) {
    console.error("❌ Unexpected error fetching announcements:", err);
    return NextResponse.json(
      { error: err.message, details: "Failed to load announcements" },
      { status: 500 }
    );
  }
}
