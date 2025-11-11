import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Missing link name" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("links").delete().eq("name", name);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Delete link error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
