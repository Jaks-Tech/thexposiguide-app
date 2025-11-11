import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("links")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ links: data || [] });
  } catch (err: any) {
    console.error("❌ Get links error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
