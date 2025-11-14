import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server Misconfigured (missing env variables)" },
        { status: 500 }
      );
    }

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
