import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing assignment ID" }, { status: 400 });
    }

    // 1️⃣ Fetch full record
    const { data, error: fetchError } = await supabaseAdmin
      .from("assignments")
      .select("path, title, year, semester, unit_name")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // 2️⃣ Delete from Supabase Storage
    const { error: storageError } = await supabaseAdmin.storage
      .from("xposilearn")
      .remove([data.path]);

    if (storageError) {
      return NextResponse.json(
        { error: "Failed to delete file from Supabase storage" },
        { status: 500 }
      );
    }

    // 3️⃣ Delete from DB
    const { error: dbError } = await supabaseAdmin
      .from("assignments")
      .delete()
      .eq("id", id);

    if (dbError) {
      return NextResponse.json(
        { error: "Failed to delete record from database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Deleted: ${data.year} › S${data.semester} › ${data.unit_name} › ${data.title}`,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
