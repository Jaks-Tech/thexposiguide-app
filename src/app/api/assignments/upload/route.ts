import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const year = formData.get("year") as string;
    const deadline = formData.get("deadline") as string;

    if (!file || !year || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `assignments/${year}/${fileName}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from("xposilearn")
      .upload(filePath, file);

    if (uploadError) {
      console.error("❌ Upload error:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = supabaseAdmin
      .storage
      .from("xposilearn")
      .getPublicUrl(filePath);

    const fileUrl = publicData?.publicUrl;

    // Insert record in DB
    const { error: dbError } = await supabaseAdmin.from("assignments").insert([
      {
        title,
        description,
        year,
        file_url: fileUrl,
        path: filePath,
        deadline,
      },
    ]);

    if (dbError) {
      console.error("❌ DB insert error:", dbError.message);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "✅ Assignment uploaded!" });
  } catch (err: any) {
    console.error("❌ Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
