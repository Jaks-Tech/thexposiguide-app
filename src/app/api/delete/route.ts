import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { category, filename, year, module } = await req.json();

    if (!category || !filename) {
      return NextResponse.json(
        { error: "Missing category or filename." },
        { status: 400 }
      );
    }

    // 🧠 Determine the bucket name
    const bucket =
      category === "module"
        ? "modules"
        : category === "notes" || category === "papers"
        ? "resources"
        : "images";

    // 🧠 Build the search filter for the uploads table
    let query = supabaseAdmin
      .from("uploads")
      .select("id, path")
      .eq("category", category)
      .eq("filename", filename);

    if (category === "notes" || category === "papers") {
      if (!year)
        return NextResponse.json(
          { error: "Missing year for notes/papers." },
          { status: 400 }
        );
      query = query.eq("year", year);
    }

    if (category === "module") {
      if (!module)
        return NextResponse.json(
          { error: "Missing module for markdown deletion." },
          { status: 400 }
        );
      query = query.eq("module", module);
    }

    // 🧩 Find file record in uploads table
    const { data, error: findError } = await query.single();
    if (findError || !data) {
      console.warn("File not found in uploads table:", findError);
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    const { id, path } = data;

    // 🗑️ Delete the file from Supabase Storage
    const { error: deleteError } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path]);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete file from storage." },
        { status: 500 }
      );
    }

    // 🗑️ Remove record from uploads table
    const { error: dbError } = await supabaseAdmin
      .from("uploads")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("Database delete error:", dbError);
      return NextResponse.json(
        { error: "Failed to delete metadata record." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "File deleted successfully." });
  } catch (err: any) {
    console.error("❌ Error deleting file:", err);
    return NextResponse.json(
      { error: "Unexpected server error.", details: err.message },
      { status: 500 }
    );
  }
}
