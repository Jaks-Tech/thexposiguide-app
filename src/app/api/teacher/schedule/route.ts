// Teacher 
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherEmail = searchParams.get("email");

    if (!teacherEmail) {
      return NextResponse.json({ error: "Teacher email required" }, { status: 400 });
    }

    // Find the teacher ID first or join directly
    const { data, error } = await supabase
      .from("allocations")
      .select(`
        *,
        units (name, year, semester),
        teachers!inner (full_name, email)
      `)
      .eq("teachers.email", teacherEmail)
      .eq("is_published", true);

    if (error) throw error;

    return NextResponse.json({ success: true, schedule: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}