import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teacher_id, unit_id, day_of_week, start_time, room_name, academic_year } = body;

    // 1. Create the Allocation as a DRAFT
    const { data: newAlloc, error } = await supabase
      .from("allocations")
      .insert([{
        teacher_id,
        unit_id,
        day_of_week,
        start_time,
        room_name,
        academic_year,
        is_published: false // 🔥 SET TO FALSE: No emails will be sent now.
      }])
      .select(`*, teachers (full_name, email), units (name, year, semester)`)
      .single();

    if (error) throw error;

    // We no longer trigger EmailService here. 
    // This allows the HOD to build the grid silently.

    return NextResponse.json({ 
      success: true, 
      allocation: newAlloc,
      message: "Draft created. Use the 'Publish' button to notify students and teachers."
    });

  } catch (err: any) {
    console.error("POST Draft Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}