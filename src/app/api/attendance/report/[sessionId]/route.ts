import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // 1. Get session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("attendance_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // 2. Get attendance records (parallel not needed here, but OK)
    const { data: records, error: recordsError } = await supabaseAdmin
      .from("attendance_records")
      .select("name, admission_number, timestamp")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: true });

    if (recordsError) throw recordsError;

    return NextResponse.json({
      session: {
        id: session.id,
        code: session.code,
        expires_at: session.expires_at,
        year: session.year,
        semester: session.semester,
        class_start_time: session.class_start_time,
        class_end_time: session.class_end_time,
      },
      records: records || [],
      count: records?.length || 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch session" },
      { status: 500 }
    );
  }
}