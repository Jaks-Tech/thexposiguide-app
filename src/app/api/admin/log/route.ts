import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { action } = await req.json();

    if (!action) {
      return NextResponse.json({ success: false, error: "Missing action" });
    }

    await supabaseAdmin.from("admin_activity").insert([{ action }]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
