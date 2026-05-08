import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { sessionId, name, admissionNumber } = await req.json();

    if (!name || !admissionNumber) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("attendance_records")
      .insert([
        {
          session_id: sessionId,
          name,
          admission_number: admissionNumber,
          timestamp: new Date(),
        },
      ]);

    if (error) {
      return NextResponse.json(
        { error: "Already submitted or invalid" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Submission failed" },
      { status: 500 }
    );
  }
}