import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { randomUUID } from "crypto";
import matter from "gray-matter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "auto";

/** Convert File → Buffer */
async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // 🧩 Extract form fields
    const category = formData.get("category") as string;
    const year = formData.get("year") as string | null;
    const module = formData.get("module") as string | null;
    const file = formData.get("file") as File | null;
    const image = formData.get("image") as File | null;

    if (!file || !category) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // ✅ Single bucket name
    const bucket = "xposilearn";

    // ✅ Determine folder (category-based)
    let folderPath = "";
    if (category === "notes") {
      folderPath = `notes/${year || "general"}`;
    } else if (category === "papers") {
      folderPath = `papers/${year || "general"}`;
    } else if (category === "module") {
      folderPath = `modules/${module || "general"}`;
    } else {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    // ✅ File naming
    const ext = file.name.split(".").pop();
    const uniqueId = randomUUID();
    const fileName = `${uniqueId}.${ext}`;
    const fullPath = `${folderPath}/${fileName}`;

    // 🧠 Convert file → buffer
    const fileBuffer = await fileToBuffer(file);

    // ✅ Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fullPath, fileBuffer, {
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Upload error:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // ✅ Get public URL
    const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(fullPath);
    const fileUrl = publicData?.publicUrl || "";

    // ✅ Extract slug if markdown file
    let slug = file.name.replace(/\.[^/.]+$/, "");
    if (ext === "md") {
      const text = fileBuffer.toString("utf8");
      const { data } = matter(text);
      if (data?.slug) slug = data.slug;
    }

    // ✅ Optional image upload (for module cards)
    let imageUrl: string | null = null;
    if (image) {
      const imgBuffer = await fileToBuffer(image);
      const imgExt = image.name.split(".").pop();
      const imgPath = `modules/${module || "general"}/${slug}.${imgExt}`;

      const { error: imgError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(imgPath, imgBuffer, {
          contentType: image.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (imgError) {
        console.error("Image upload error:", imgError.message);
      } else {
        const { data: imgPublic } = supabaseAdmin.storage
          .from(bucket)
          .getPublicUrl(imgPath);
        imageUrl = imgPublic.publicUrl;
      }
    }

    // ✅ Save metadata to DB
    const { error: insertError } = await supabaseAdmin.from("uploads").insert([
      {
        filename: file.name,
        category,
        year,
        module,
        file_url: fileUrl,
        image_url: imageUrl,
        path: fullPath,
        slug,
      },
    ]);

    if (insertError) {
      console.error("DB insert error:", insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "✅ Uploaded successfully!",
      slug,
      url: fileUrl,
      image: imageUrl,
    });
  } catch (err: any) {
    console.error("❌ Upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed.", details: err.message },
      { status: 500 }
    );
  }
}
