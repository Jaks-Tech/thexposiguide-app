import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year"); // "Year 1", etc.
    const semester = searchParams.get("semester");

    if (!year || !semester) {
      return NextResponse.json(
        { success: false, error: "Missing Year or Semester" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("allocations")
      .select(`
        id,
        day_of_week,
        start_time,
        room_name,
        is_published,
        teachers (
          full_name
        ),
        units!inner (
          name,
          year,
          semester
        )
      `)
      .eq("units.year", year)
      .eq("units.semester", parseInt(semester))
      .eq("is_published", true);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      allocations: data || [],
    });

  } catch (err: any) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}