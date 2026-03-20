import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { full_name, email, year, semester } = await req.json();

    if (!email || !year || !semester) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("students")
      .insert([
        {
          full_name,
          email: email.toLowerCase().trim(),
          year: year.toLowerCase(),
          semester: Number(semester),
        },
      ])
      .select();

    if (error) {
      // Handle unique constraint error (student already exists)
      if (error.code === '23505') {
        return NextResponse.json({ error: "This email is already enrolled." }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, student: data[0] });
  } catch (err: any) {
    console.error("❌ Add Student Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}