import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let body = null;

    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { category, year, semester, unit_name, module } = body;

    if (!category) {
      return NextResponse.json(
        { error: "Missing category in request." },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------
    // BASE QUERY
    // -------------------------------------------------------------
    let query = supabaseAdmin
      .from("uploads")
      .select(
        "id, filename, path, category, year, semester, unit_name, module"
      )
      .eq("category", category);

    // -------------------------------------------------------------
    // NOTES & PAPERS FILTERING
    // -------------------------------------------------------------
    if (category === "notes" || category === "papers") {
      if (!year) {
        return NextResponse.json(
          { error: "Missing year for notes/papers." },
          { status: 400 }
        );
      }

      // match correct year: year-1 / year-2 / year-3
      query = query.eq("year", year);

      // semester is numeric
      if (semester) {
        query = query.eq("semester", semester);
      }

      // FIXED: partial search + wildcards
      if (unit_name && unit_name.trim() !== "") {
        query = query.ilike("unit_name", `%${unit_name.trim()}%`);
      }
    }

    // -------------------------------------------------------------
    // MODULE MARKDOWN (upper / lower / pelvic)
    // -------------------------------------------------------------
    if (category === "module") {
      if (!module) {
        return NextResponse.json(
          { error: "Missing module type for markdown listing." },
          { status: 400 }
        );
      }

      query = query.eq("module", module);
    }

    // -------------------------------------------------------------
    // EXECUTE QUERY
    // -------------------------------------------------------------
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("❌ list-files error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ files: [] });
    }

    // -------------------------------------------------------------
    // CLEAN RETURN
    // -------------------------------------------------------------
    const files = data.map((row) => ({
      id: row.id,
      filename: row.filename,
      path: row.path,
      category: row.category,
      year: row.year,
      semester: row.semester,
      unit_name: row.unit_name,
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
