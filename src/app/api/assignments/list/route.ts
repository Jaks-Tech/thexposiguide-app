import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("assignments")
    .select("id, title, year")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching assignments:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ assignments: data });
}
