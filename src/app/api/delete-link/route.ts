import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// ✅ Match the real file used by XPosiLearn page
const LINKS_PATH = path.join(process.cwd(), "public", "xposilearn", "useful-links.json");

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Missing link name" }, { status: 400 });
    }

    if (!fs.existsSync(LINKS_PATH)) {
      return NextResponse.json({ error: "useful-links.json not found" }, { status: 404 });
    }

    const links = JSON.parse(fs.readFileSync(LINKS_PATH, "utf8"));
    const updated = links.filter((link: any) => link.name !== name);

    fs.writeFileSync(LINKS_PATH, JSON.stringify(updated, null, 2));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting link:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
