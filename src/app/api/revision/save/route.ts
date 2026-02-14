import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { created_by, module, projection_name, markdown } = body;

    if (!module || !projection_name || !markdown) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { error } = await supabaseAdmin
      .from("revision_projections")
      .insert([
        {
          created_by: created_by || null,
          module,
          projection_name,
          markdown,
          expires_at,
        },
      ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
