import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { students } = await req.json();

    // 1. Basic Validation
    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: "The student list is empty or invalid." }, 
        { status: 400 }
      );
    }

    // 2. Data Sanitization
    // We trim whitespace and lowercase emails to ensure consistency
    const sanitizedStudents = students.map((s: any) => ({
      full_name: s.full_name?.trim(),
      email: s.email?.toLowerCase().trim(),
      year: s.year?.toLowerCase().trim(),
      semester: Number(s.semester),
    })).filter(s => s.email && s.year); // Remove any rows that ended up empty

    // 3. Database Operation (Upsert)
    // 'onConflict: email' means if a student email already exists, 
    // it will update their Name/Year/Sem instead of creating a duplicate.
    const { data, error } = await supabaseAdmin
      .from("students")
      .upsert(sanitizedStudents, { onConflict: 'email' }) 
      .select();

    if (error) {
      console.error("Supabase Bulk Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. Return Success
    return NextResponse.json({ 
      success: true, 
      count: data?.length || 0 
    });

  } catch (err: any) {
    console.error("❌ Bulk Insert Route Error:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error during bulk upload." }, 
      { status: 500 }
    );
  }
}