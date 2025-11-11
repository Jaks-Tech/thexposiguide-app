import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { id, title, message, start_time, end_time, repeat_rule, repeat_days } = await req.json();

    const { error } = await supabaseAdmin
      .from("announcements")
      .update({ title, message, start_time, end_time, repeat_rule, repeat_days })
      .eq("id", id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, message: "Announcement updated." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
