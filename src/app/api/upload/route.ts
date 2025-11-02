import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import formidable, { Fields, Files } from "formidable";
import { Readable } from "node:stream";

// ✅ Use new Next.js 16 route-level exports
export const dynamic = "force-dynamic";  // allow dynamic processing
export const runtime = "nodejs";         // ensure Node APIs (fs, stream) are available
export const preferredRegion = "auto";   // optional, good for Vercel Edge balance

/** 🧩 Convert Next.js Request → Node readable stream (emulate IncomingMessage) */
function toNodeRequest(req: Request): any {
  const readable = new Readable();
  readable._read = () => {};

  req.arrayBuffer().then((ab) => {
    readable.push(Buffer.from(ab));
    readable.push(null);
  });

  // Emulate Node IncomingMessage for formidable
  const nodeReq = readable as unknown as Readable & {
    headers: Record<string, string>;
    method?: string;
    url?: string;
  };

  nodeReq.headers = Object.fromEntries(req.headers.entries());
  nodeReq.method = req.method;
  nodeReq.url = req.url;

  return nodeReq;
}

/** 🧠 Parse multipart form-data (file + image + metadata) */
async function parseForm(req: Request): Promise<{ fields: Fields; files: Files }> {
  const form = formidable({ multiples: true, keepExtensions: true });

  return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    const nodeReq = toNodeRequest(req);
    form.parse(nodeReq, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

/** 🪶 Ensure directory exists */
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

/** 📤 Handle file upload */
export async function POST(req: Request) {
  try {
    const { fields, files } = await parseForm(req);

    // Extract metadata
    const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
    const year = Array.isArray(fields.year) ? fields.year[0] : fields.year;
    const module = Array.isArray(fields.module) ? fields.module[0] : fields.module;

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    const uploadedImage = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!uploadedFile) {
      return NextResponse.json({ error: "Missing file or details." }, { status: 400 });
    }

    const originalName = uploadedFile.originalFilename || "upload.md";
    const ext = path.extname(originalName).toLowerCase();

    // ✅ Determine target directory
    let targetDir = "";
    if (category === "notes" || category === "papers") {
      if (!year)
        return NextResponse.json({ error: "Missing year for notes/papers." }, { status: 400 });
      targetDir = path.join(process.cwd(), "public", "xposilearn", category, year);
    } else if (category === "module") {
      if (!module)
        return NextResponse.json({ error: "Missing module for markdown upload." }, { status: 400 });
      targetDir = path.join(process.cwd(), "public", "xposilearn", "modules", module);
    } else {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    ensureDir(targetDir);

    // ✅ Save uploaded file
    const buffer = fs.readFileSync(uploadedFile.filepath);
    const destPath = path.join(targetDir, originalName);
    fs.writeFileSync(destPath, buffer);

    let slug = path.basename(originalName, ext);

    // ✅ Extract slug from Markdown frontmatter (if present)
    if (ext === ".md") {
      const raw = fs.readFileSync(destPath, "utf8");
      const { data } = matter(raw);
      if (data?.slug) slug = data.slug;
    }

    // ✅ Handle image upload
    let imageName: string | null = null;
    if (uploadedImage) {
      const imgBuffer = fs.readFileSync(uploadedImage.filepath);
      const imgExt = path.extname(uploadedImage.originalFilename || "").toLowerCase();
      const imageTargetDir = path.join(process.cwd(), "public", "illustrations", module || "misc");

      ensureDir(imageTargetDir);

      imageName = `${slug}${imgExt}`;
      const imagePath = path.join(imageTargetDir, imageName);

      fs.writeFileSync(imagePath, imgBuffer);
      console.log(`🖼️ Saved image as: ${imageName}`);

      // ✅ Update Markdown frontmatter with image reference
      if (ext === ".md") {
        const raw = fs.readFileSync(destPath, "utf8");
        const parsed = matter(raw);
        parsed.data.image = imageName;
        const newMd = matter.stringify(parsed.content, parsed.data);
        fs.writeFileSync(destPath, newMd);
        console.log(`🧾 Updated frontmatter with image: ${imageName}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully!",
      slug,
      image: imageName,
    });
  } catch (err: any) {
    console.error("❌ Upload error:", err);
    return NextResponse.json({ error: "Upload failed. See server logs." }, { status: 500 });
  }
}
