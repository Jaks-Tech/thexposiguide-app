import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function POST(req: Request) {
  try {
    const { category, year, module } = await req.json();
    const root = process.cwd();
    let dir = "";

    // ✅ Notes & Papers
    if (category === "notes" || category === "papers") {
      if (!year) {
        return NextResponse.json(
          { error: "Missing year for notes/papers" },
          { status: 400 }
        );
      }
      dir = path.join(root, "public", "xposilearn", category, year);
    }

    // ✅ Modules (new structure)
    else if (category === "module") {
      if (!module) {
        return NextResponse.json(
          { error: "Missing module for markdown listing" },
          { status: 400 }
        );
      }
      dir = path.join(root, "public", "xposilearn", "modules", module);
    }

    // Validate directory
    if (!fs.existsSync(dir)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md") || f.endsWith(".pdf") || f.endsWith(".docx"));

    return NextResponse.json({ files });
  } catch (err: any) {
    console.error("Error listing files:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
