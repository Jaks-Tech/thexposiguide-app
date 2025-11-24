import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Extract fields
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;

    // YEAR MUST BE "year-1" / "year-2" / "year-3"
    const rawYear = formData.get("year") as string | null;
    const year = rawYear ? rawYear.toLowerCase() : null;

    // Semester must be integer 1 or 2
    const semesterRaw = formData.get("semester") as string | null;
    const semester = semesterRaw ? Number(semesterRaw) : null;

    // Unit name (string)
    const unitName = formData.get("unit_name") as string | null;

    // Optional deadline field
    const deadline = formData.get("deadline") as string | null;

    // Validate required fields
    if (!title || !year || !semester || !unitName) {
      return NextResponse.json(
        { error: "Missing required fields (title, year, semester, unit name)." },
        { status: 400 }
      );
    }

    let fileUrl: string | null = null;
    let filePath: string | null = null;

    // ------------------------------------------------------------
    // OPTIONAL FILE UPLOAD
    // ------------------------------------------------------------
    if (file) {
      const ext = file.name.split(".").pop();
      const uniqueName = `${randomUUID()}.${ext}`;

      // Example path:
      // assignments/year-1/sem-1/<uuid>.pdf
      filePath = `assignments/${year}/sem-${semester}/${uniqueName}`;

      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabaseAdmin.storage
        .from("xposilearn")
        .upload(filePath, buffer, {
          contentType: file.type || "application/octet-stream",
        });

      if (uploadError) {
        console.error("❌ Upload error:", uploadError.message);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: pub } = supabaseAdmin
        .storage
        .from("xposilearn")
        .getPublicUrl(filePath);

      fileUrl = pub?.publicUrl || null;
    }

    // ------------------------------------------------------------
    // INSERT INTO DATABASE
    // ------------------------------------------------------------
    const { error: dbError } = await supabaseAdmin
      .from("assignments")
      .insert([
        {
          title,
          description,
          year,              // "year-1"
          semester,          // 1 or 2
          unit_name: unitName,
          deadline,
          file_url: fileUrl,
          path: filePath,
        },
      ]);

    if (dbError) {
      console.error("❌ DB insert error:", dbError.message);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "✅ Assignment uploaded successfully!",
    });
  } catch (err: any) {
    console.error("❌ Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
