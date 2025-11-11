import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Delete file by unique ID */
export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
    }

    const bucket = "xposilearn";

    // 1️⃣ Fetch file entry by ID
    const { data: entry, error: fetchError } = await supabaseAdmin
      .from("uploads")
      .select("id, filename, path")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !entry) {
      return NextResponse.json(
        { error: "File not found in database" },
        { status: 404 }
      );
    }

    // 2️⃣ Delete from Storage
    const { error: storageError } = await supabaseAdmin.storage
      .from(bucket)
      .remove([entry.path]);

    if (storageError) {
      console.error("❌ Storage delete error:", storageError.message);
      return NextResponse.json(
        { error: "Failed to delete from storage" },
        { status: 500 }
      );
    }

    // 3️⃣ Delete from uploads table
    const { error: dbError } = await supabaseAdmin
      .from("uploads")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("❌ DB delete error:", dbError.message);
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
    console.error("❌ Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error", details: err.message },
      { status: 500 }
    );
  }
}
