import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * 📂 Lists uploaded files from Supabase based on category/year/module.
 * Used by the Admin Dashboard dropdown for file deletion.
 */
export async function POST(req: Request) {
  try {
    let body = null;

    // ✅ Safely parse JSON, handle empty or invalid body
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { category, year, module } = body;

    if (!category) {
      return NextResponse.json(
        { error: "Missing category in request." },
        { status: 400 }
      );
    }

    // 🧠 Query uploads metadata
    let query = supabaseAdmin
      .from("uploads")
      .select("id, filename, path, category, year, module")
      .eq("category", category);

    if (category === "notes" || category === "papers") {
      if (!year) {
        return NextResponse.json(
          { error: "Missing year for notes/papers." },
          { status: 400 }
        );
      }
      query = query.eq("year", year);
    }

    if (category === "module") {
      if (!module) {
        return NextResponse.json(
          { error: "Missing module for markdown listing." },
          { status: 400 }
        );
      }
      query = query.eq("module", module);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase list-files error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.warn(`⚠️ No files found for ${category} (${year || module || "none"})`);
      return NextResponse.json({ files: [] });
    }

    // ✅ Map clean results
    const files = data.map((row) => ({
      id: row.id,
      filename: row.filename,
      path: row.path,
      category: row.category,
      year: row.year,
      module: row.module,
    }));

    return NextResponse.json({ files });
  } catch (err: any) {
    console.error("❌ Error listing files:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
