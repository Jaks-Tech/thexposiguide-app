import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendNotification } from "@/lib/mailer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { title, message, start_time, end_time, repeat_rule, repeat_days } = await req.json();

    if (!title || !message || !start_time || !end_time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Insert into Database
    const { error: dbError } = await supabaseAdmin.from("announcements").insert([
      { title, message, start_time, end_time, repeat_rule, repeat_days, is_active: true }
    ]);

    if (dbError) throw dbError;

    // 2. Broadcast to ALL Students
    try {
      const { data: students, error: studentError } = await supabaseAdmin
        .from("students")
        .select("email");

      if (!studentError && students && students.length > 0) {
        const emailList = students.map((s) => s.email);

        sendNotification({
          to: emailList,
          subject: `Radiography Department Update: ${title}`,
          type: 'Announcement',
          title: title,
          content: message,
          link: `${process.env.NEXT_PUBLIC_SITE_URL}/announcements`
        });
        
        console.log(`✅ Announcement broadcasted to ${emailList.length} students.`);
      }
    } catch (mailErr) {
      console.error("⚠️ Email broadcast failed:", mailErr);
    }

    return NextResponse.json({ success: true, message: "✅ Announcement created and broadcasted." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const now = new Date();
    const today = now.toLocaleString("en-US", { weekday: "long" });

    const { data, error } = await supabaseAdmin.from("announcements").select("*").eq("is_active", true);
    if (error) throw error;

    for (const a of data || []) {
      const start = new Date(a.start_time);
      const end = new Date(a.end_time);
      let updated = false;

      if (a.repeat_rule === "daily" && now > end) {
        start.setDate(start.getDate() + 1);
        end.setDate(end.getDate() + 1);
        updated = true;
      } else if (a.repeat_rule === "weekly" && now > end) {
        start.setDate(start.getDate() + 7);
        end.setDate(end.getDate() + 7);
        updated = true;
      } else if (a.repeat_rule === "custom" && now > end && a.repeat_days?.includes(today)) {
        start.setDate(start.getDate() + 7);
        end.setDate(end.getDate() + 7);
        updated = true;
      }

      if (updated) {
        await supabaseAdmin.from("announcements").update({
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        }).eq("id", a.id);
      }
    }
    return NextResponse.json({ success: true, message: "♻️ Announcements refreshed." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}