import { NextResponse } from "next/server";
import { TeacherService } from "@/services/enrollment/teacher-logic";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("full_name", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, teachers: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Using the Service Layer for validation and sanitization
    const teacher = await TeacherService.enrollTeacher(body);
    return NextResponse.json({ success: true, teacher });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}