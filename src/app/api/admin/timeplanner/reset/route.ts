// Reset 
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  const { error } = await supabase
    .from("allocations")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Standard way to delete all rows safely

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, message: "Schedule cleared for new semester." });
}