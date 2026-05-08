import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getDistanceInMeters } from "@/lib/attendance/haversine";

export async function POST(req: Request) {
  try {
    const { sessionId, code, latitude, longitude } = await req.json();

    const { data: session, error } = await supabaseAdmin
      .from("attendance_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    if (session.code !== code) {
      return NextResponse.json({ error: "Wrong code" }, { status: 400 });
    }

    if (new Date() > new Date(session.expires_at)) {
      return NextResponse.json({ error: "Session expired" }, { status: 400 });
    }

    const distance = getDistanceInMeters(
      latitude,
      longitude,
      session.latitude,
      session.longitude
    );

    if (distance > session.radius_meters) {
      return NextResponse.json(
        { error: "You are not within class location" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Validation failed" },
      { status: 500 }
    );
  }
}