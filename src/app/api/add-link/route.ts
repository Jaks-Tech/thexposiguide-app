import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, url, category } = body;

    if (!name || !url) {
      return NextResponse.json({ error: "Missing name or URL." }, { status: 400 });
    }

    const root = process.cwd();
    const filePath = path.join(root, "public", "xposilearn", "useful-links.json");

    let existing: any[] = [];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      existing = JSON.parse(data);
    }

    existing.push({ name, url, category });

    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add link failed:", error);
    return NextResponse.json({ error: "Failed to add link" }, { status: 500 });
  }
}
