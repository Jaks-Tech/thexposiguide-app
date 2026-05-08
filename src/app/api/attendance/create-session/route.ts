import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      year,
      semester,
      classStartTime,
      classEndTime,
      lecturerEmail,
      latitude,
      longitude,
    } = body;

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const { data, error } = await supabaseAdmin
      .from("attendance_sessions")
      .insert([
        {
          code,
          year,
          semester,
          class_start_time: classStartTime,
          class_end_time: classEndTime,
          lecturer_email: lecturerEmail,
          latitude,
          longitude,
          radius_meters: 100,
          expires_at: expiresAt,
          processed: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: data.id,
      code,
      expiresAt,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create session" },
      { status: 500 }
    );
  }
}