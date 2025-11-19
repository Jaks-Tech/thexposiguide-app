import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { randomUUID } from "crypto";
import matter from "gray-matter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "auto";

async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // 🔹 Multi-file support
    const files = formData.getAll("file") as File[];
    const image = formData.get("image") as File | null;

    const category = formData.get("category") as string;
    const year = formData.get("year") as string | null;
    const module = formData.get("module") as string | null;

    if (!files.length || !category) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const bucket = "xposilearn";

    // 📁 Determine folder path
    let folderPath = "";
    if (category === "notes") folderPath = `notes/${year || "general"}`;
    else if (category === "papers") folderPath = `papers/${year || "general"}`;
    else if (category === "module") folderPath = `modules/${module || "general"}`;
    else return NextResponse.json({ error: "Invalid category." }, { status: 400 });

    // --------------------------------------------------------
    // 🔥 Process ALL files in parallel
    // --------------------------------------------------------
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const ext = file.name.split(".").pop()?.toLowerCase();
        const uniqueId = randomUUID();
        const fileName = `${uniqueId}.${ext}`;
        const fullPath = `${folderPath}/${fileName}`;

        const fileBuffer = await fileToBuffer(file);

        // Upload
        const { error: uploadError } = await supabaseAdmin.storage
          .from(bucket)
          .upload(fullPath, fileBuffer, {
            contentType: file.type || "application/octet-stream",
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError.message);
          return { error: uploadError.message };
        }

        // Public URL
        const { data: publicUrlData } = supabaseAdmin.storage
          .from(bucket)
          .getPublicUrl(fullPath);

        const fileUrl = publicUrlData?.publicUrl || "";

        // Extract slug if markdown
        let slug = file.name.replace(/\.[^/.]+$/, "");
        if (category === "module" && ext === "md") {
          const text = fileBuffer.toString("utf8");
          const { data } = matter(text);
          if (data?.slug) slug = data.slug;
        }

        // Insert DB row
        const { error: insertError } = await supabaseAdmin
          .from("uploads")
          .insert([
            {
              filename: file.name,
              category,
              year,
              module,
              file_url: fileUrl,
              path: fullPath,
              slug,
            },
          ]);

        if (insertError) {
          console.error("DB insert error:", insertError.message);
          return { error: insertError.message };
        }

        return { success: true, slug, url: fileUrl };
      })
    );

    // --------------------------------------------------------
    // 🔥 Upload module thumbnail (only once)
    // --------------------------------------------------------
    let imageUrl: string | null = null;

    if (image) {
      const imgExt = image.name.split(".").pop();
      const firstFile = files[0];
      const fallbackSlug = firstFile.name.replace(/\.[^/.]+$/, "");

      const imgPath = `modules/${module || "general"}/${fallbackSlug}.${imgExt}`;
      const buffer = await fileToBuffer(image);

      const { error: imgErr } = await supabaseAdmin.storage
        .from(bucket)
        .upload(imgPath, buffer, {
          contentType: image.type,
          upsert: false,
        });

      if (!imgErr) {
        const { data: imgPub } = supabaseAdmin
          .storage
          .from(bucket)
          .getPublicUrl(imgPath);
        imageUrl = imgPub?.publicUrl || null;
      } else {
        console.error("Image upload error:", imgErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadResults,
      imageUrl,
    });
  } catch (err: any) {
    console.error("❌ Upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed.", details: err.message },
      { status: 500 }
    );
  }
}
