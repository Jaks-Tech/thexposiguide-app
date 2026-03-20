import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// 🔍 Fetch all students
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, students: data });
  } catch (err: any) {
    console.error("GET Students Error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 🗑️ Delete a student
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("students")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE Student Error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}