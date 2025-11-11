import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Automatically refresh recurring announcements */
export async function GET() {
  try {
    const now = new Date();
    const today = now.toLocaleString("en-US", { weekday: "long" });
    const nowISO = now.toISOString();

    const { data, error } = await supabaseAdmin
      .from("announcements")
      .select("*")
      .eq("is_active", true);

    if (error) throw new Error(error.message);

    for (const a of data || []) {
      const start = new Date(a.start_time);
      const end = new Date(a.end_time);

      if (a.repeat_rule === "daily" && now > end) {
        start.setDate(start.getDate() + 1);
        end.setDate(end.getDate() + 1);
      }

      if (a.repeat_rule === "weekly" && now > end) {
        start.setDate(start.getDate() + 7);
        end.setDate(end.getDate() + 7);
      }

      if (a.repeat_rule === "custom" && now > end && a.repeat_days?.includes(today)) {
        start.setDate(start.getDate() + 7);
        end.setDate(end.getDate() + 7);
      }

      // Update time only if it was regenerated
      if (start > new Date(a.start_time)) {
        await supabaseAdmin
          .from("announcements")
          .update({
            start_time: start.toISOString(),
            end_time: end.toISOString(),
          })
          .eq("id", a.id);
      }
    }

    return NextResponse.json({ success: true, message: "Recurring announcements refreshed." });
  } catch (err: any) {
    console.error("❌ Error refreshing announcements:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
