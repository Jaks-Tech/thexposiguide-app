import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { name, url, category } = await req.json();
    if (!name || !url) {
      return NextResponse.json({ error: "Missing link name or URL" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("links")
      .insert([{ name, url, category }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Add link error:", err);
    return NextResponse.json({ error: err.message || "Failed to add link" }, { status: 500 });
  }
}
