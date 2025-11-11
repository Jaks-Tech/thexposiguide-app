import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { category, year, module } = await req.json();

    if (!category) {
      return NextResponse.json({ error: "Missing category" }, { status: 400 });
    }

    // 🧠 Query uploads metadata table in Supabase
    let query = supabaseAdmin.from("uploads").select("filename, category, year, module");

    query = query.eq("category", category);

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
          { error: "Missing module for markdown listing." },
          { status: 400 }
        );
      query = query.eq("module", module);
    }

    const { data, error } = await query.order("filename", { ascending: true });

    if (error) {
      console.error("❌ Supabase list-files error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const files = data?.map((row: any) => row.filename) || [];

    return NextResponse.json({ files });
  } catch (err: any) {
    console.error("❌ Error listing files:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
