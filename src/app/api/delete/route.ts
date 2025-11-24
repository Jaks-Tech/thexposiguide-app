import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Delete a file from:
 *  - Supabase Storage (xposilearn bucket)
 *  - uploads table (notes, papers, modules)
 */
export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing file ID" },
        { status: 400 }
      );
    }

    const bucket = "xposilearn";

    // -----------------------------------------------------
    // 1️⃣ Fetch DB record (now includes semester + unit_name)
    // -----------------------------------------------------
    const { data: entry, error: fetchError } = await supabaseAdmin
      .from("uploads")
      .select("id, filename, path, category, year, semester, unit_name, module")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !entry) {
      return NextResponse.json(
        { error: "File not found in database" },
        { status: 404 }
      );
    }

    // -----------------------------------------------------
    // 2️⃣ Delete file from Supabase storage
    // -----------------------------------------------------
    const { error: storageError } = await supabaseAdmin.storage
      .from(bucket)
      .remove([entry.path]); // always safe — full path stored

    if (storageError) {
      console.error("❌ Storage delete error:", storageError.message);
      return NextResponse.json(
        { error: "Failed to delete file from storage" },
        { status: 500 }
      );
    }

    // -----------------------------------------------------
    // 3️⃣ Delete row from uploads table
    // -----------------------------------------------------
    const { error: dbError } = await supabaseAdmin
      .from("uploads")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("❌ Database delete error:", dbError.message);
      return NextResponse.json(
        { error: "Failed to delete record from database" },
        { status: 500 }
      );
    }

    console.log(`✅ Deleted file: ${entry.filename}`);
    return NextResponse.json({
      success: true,
      message: `✅ Successfully deleted ${entry.filename}`,
    });
  } catch (err: any) {
    console.error("❌ Unexpected delete error:", err);
    return NextResponse.json(
      { error: "Unexpected server error", details: err.message },
      { status: 500 }
    );
  }
}
