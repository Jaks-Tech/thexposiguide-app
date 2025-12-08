import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { randomUUID } from "crypto";
import matter from "gray-matter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* ----------------------------------------------
   Helper: Convert File → Buffer
---------------------------------------------- */
async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/* ----------------------------------------------
   Helper: Normalize Year
---------------------------------------------- */
function normalizeYear(raw: string | null): string {
  if (!raw) return "Other";
  const t = raw.toLowerCase();

  if (t.includes("1")) return "Year 1";
  if (t.includes("2")) return "Year 2";
  if (t.includes("3")) return "Year 3";
  return "Other";
}

/* ----------------------------------------------
   POST — Upload Handler
---------------------------------------------- */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // -------- Files --------
    const files = formData.getAll("file") as File[];
    const image = formData.get("image") as File | null;

    // -------- Fields --------
    const category = formData.get("category") as string | null;
    const yearRaw = formData.get("year") as string | null;
    const module = (formData.get("module") as string | null)?.trim() || null;

    const semesterRaw = formData.get("semester") as string | null;
    const semester = semesterRaw ? Number(semesterRaw) : null;

    const unitName =
      (formData.get("unit_name") as string | null)?.trim() || null;

    if (!files.length || !category) {
      return NextResponse.json(
        { error: "Missing file(s) or category." },
        { status: 400 }
      );
    }

    // -------- Normalize Year --------
    const year = normalizeYear(yearRaw);

    // ----------------------------------------------
    // Determine Folder
    // ----------------------------------------------
    let folderPath = "";

    if (category === "notes") {
      folderPath = `notes/${year}`;
    } else if (category === "papers") {
      folderPath = `papers/${year}`;
    } else if (category === "module") {
      if (!module) {
        return NextResponse.json(
          { error: "Missing module name for module category." },
          { status: 400 }
        );
      }
      folderPath = `modules/${module}`; // 🔥 Ensures match with Pelvic page
    } else {
      return NextResponse.json(
        { error: "Invalid category." },
        { status: 400 }
      );
    }

    const bucket = "xposilearn";

    /* ----------------------------------------------
       Upload All Files (Markdown first)
    ---------------------------------------------- */
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const ext = file.name.split(".").pop()?.toLowerCase() || "file";
        const uniqueId = randomUUID();
        const fileName = `${uniqueId}.${ext}`;
        const fullPath = `${folderPath}/${fileName}`;

        // Upload to Supabase Storage
        const buffer = await fileToBuffer(file);

        const { error: uploadError } = await supabaseAdmin.storage
          .from(bucket)
          .upload(fullPath, buffer, {
            contentType: file.type || "application/octet-stream",
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("❌ Storage upload error:", uploadError.message);
          return { error: uploadError.message };
        }

        // Public URL
        const { data: pub } = supabaseAdmin.storage
          .from(bucket)
          .getPublicUrl(fullPath);

        const fileUrl = pub?.publicUrl || "";

        // Markdown slug extraction
        let slug = file.name.replace(/\.[^/.]+$/, "");

        if (category === "module" && ext === "md") {
          const text = buffer.toString("utf8");
          const matterData = matter(text);
          if (matterData?.data?.slug) slug = matterData.data.slug;
        }

        /* ----------------------------------------------
           Insert Row into uploads table
        ---------------------------------------------- */
        const { error: insertErr } = await supabaseAdmin
          .from("uploads")
          .insert([
            {
              filename: file.name,
              category,
              year,
              semester: category === "module" ? null : semester,
              unit_name: category === "module" ? null : unitName,
              module,                      // 🔥 consistent module storage
              file_url: fileUrl,
              path: fullPath,
              slug,                         // 🔥 page loads using this
            },
          ]);

        if (insertErr) {
          console.error("❌ DB insert error:", insertErr.message);
          return { error: insertErr.message };
        }

        return { success: true, url: fileUrl, slug };
      })
    );

    /* ----------------------------------------------
       Optional Module Thumbnail Upload
    ---------------------------------------------- */
    let imageUrl: string | null = null;

    if (category === "module" && image) {
      // Thumbnail must use the same slug as markdown
      const mdRecord = uploadResults.find((r: any) => r.slug);
      const slug = mdRecord?.slug;

      const imgExt = image.name.split(".").pop() || "jpg";
      const imgPath = `${folderPath}/${slug}.${imgExt}`; // 🔥 MATCHES markdown

      const imgBuffer = await fileToBuffer(image);

      const { error: imgErr } = await supabaseAdmin.storage
        .from(bucket)
        .upload(imgPath, imgBuffer, {
          contentType: image.type,
          upsert: true,         // 🔥 allow replacing thumbnail cleanly
        });

      if (!imgErr) {
        const { data: imgPub } = supabaseAdmin.storage
          .from(bucket)
          .getPublicUrl(imgPath);

        imageUrl = imgPub?.publicUrl || null;
      } else {
        console.error("Thumbnail upload error:", imgErr.message);
      }
    }

    return NextResponse.json(
      {
        success: true,
        uploaded: uploadResults,
        imageUrl,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Upload route failed:", err);
    return NextResponse.json(
      { error: "Upload failed.", details: err.message },
      { status: 500 }
    );
  }
}
