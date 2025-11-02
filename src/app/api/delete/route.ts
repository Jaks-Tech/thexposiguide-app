import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function POST(req: Request) {
  try {
    const { category, filename, year, module } = await req.json();

    if (!category || !filename) {
      return NextResponse.json(
        { error: "Missing category or filename." },
        { status: 400 }
      );
    }

    const root = process.cwd();
    let filePath = "";

    // ✅ For notes and papers
    if (category === "notes" || category === "papers") {
      if (!year) {
        return NextResponse.json(
          { error: "Missing year for notes/papers." },
          { status: 400 }
        );
      }
      filePath = path.join(root, "public", "xposilearn", category, year, filename);
    }

    // ✅ For module markdown files (new structure)
    else if (category === "module") {
      if (!module) {
        return NextResponse.json(
          { error: "Missing module for markdown deletion." },
          { status: 400 }
        );
      }

      // ✅ Updated to new path
      filePath = path.join(
        root,
        "public",
        "xposilearn",
        "modules",
        module,
        filename
      );

      // Also delete associated image if present
      const baseName = filename.replace(/\.md$/, "");
      const imageDir = path.join(root, "public", "illustrations", module);
      const extensions = [".jpg", ".jpeg", ".png", ".webp"];
      for (const ext of extensions) {
        const imgPath = path.join(imageDir, baseName + ext);
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
          console.log(`🖼️ Deleted image: ${imgPath}`);
        }
      }
    }

    // ✅ Verify existence and delete
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    fs.unlinkSync(filePath);
    console.log(`🗑️ Deleted file: ${filePath}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting file:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
