import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use SERVICE_ROLE_KEY to bypass RLS for administrative updates
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await supabase.from("allocations").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; 
    const body = await req.json();
    const { teacher_id, room_name, unit_id, day_of_week, start_time } = body;

    // 1. UPDATE THE DATABASE AS A DRAFT
    const { data: updatedAlloc, error } = await supabase
      .from("allocations")
      .update({ 
        teacher_id, 
        room_name, 
        unit_id,
        day_of_week, 
        start_time,
        is_published: false // 🔥 Mark as draft: No emails will be sent during the edit
      })
      .eq("id", id)
      .select(`
        *,
        teachers (full_name, email),
        units (name, year, semester)
      `)
      .single();

    if (error) throw error;

    // Email dispatch logic has been removed from here.
    // It will now be handled exclusively by the /publish route.

    return NextResponse.json({ 
      success: true, 
      allocation: updatedAlloc,
      message: "Change saved as draft. Hit 'Publish' to notify the department." 
    });

  } catch (err: any) {
    console.error("PATCH Update Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}