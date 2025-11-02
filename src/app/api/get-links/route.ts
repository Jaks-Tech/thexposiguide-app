import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// ✅ Correct file path
const LINKS_PATH = path.join(process.cwd(), "public", "xposilearn", "useful-links.json");

export async function GET() {
  try {
    if (!fs.existsSync(LINKS_PATH)) {
      console.warn("No useful-links.json found at:", LINKS_PATH);
      return NextResponse.json({ links: [] });
    }

    const jsonData = fs.readFileSync(LINKS_PATH, "utf8");
    const links = JSON.parse(jsonData);

    return NextResponse.json({ links });
  } catch (err: any) {
    console.error("Error reading useful-links.json:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
