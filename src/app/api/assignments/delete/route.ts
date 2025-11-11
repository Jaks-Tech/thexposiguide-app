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

    // 1️⃣ Get the assignment record
    const { data, error: fetchError } = await supabaseAdmin
      .from("assignments")
      .select("path, title")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("❌ Error fetching assignment:", fetchError.message);
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
      console.error("❌ Storage deletion error:", storageError.message);
      return NextResponse.json(
        { error: "Failed to delete file from Supabase storage" },
        { status: 500 }
      );
    }

    // 3️⃣ Delete record from database
    const { error: dbError } = await supabaseAdmin
      .from("assignments")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("❌ Database deletion error:", dbError.message);
      return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
    }

    console.log(`✅ Deleted assignment: ${data.title}`);
    return NextResponse.json({ success: true, message: "✅ Assignment deleted successfully!" });
  } catch (err: any) {
    console.error("❌ Unexpected error deleting assignment:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
