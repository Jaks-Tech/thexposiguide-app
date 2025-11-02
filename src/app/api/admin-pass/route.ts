import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PASS_FILE = path.join(process.cwd(), "admin-pass.json");

/**
 * 🧠 GET: Check if password exists (for debugging or setup)
 */
export async function GET() {
  try {
    if (!fs.existsSync(PASS_FILE)) {
      return NextResponse.json({ exists: false });
    }
    return NextResponse.json({ exists: true });
  } catch {
    return NextResponse.json({ error: "Unable to read password file" }, { status: 500 });
  }
}

/**
 * 🔐 POST: Verify password
 */
export async function POST(req: Request) {
  const { password } = await req.json();

  let storedPass = process.env.ADMIN_PASS;
  if (fs.existsSync(PASS_FILE)) {
    const data = JSON.parse(fs.readFileSync(PASS_FILE, "utf8"));
    storedPass = data.password;
  }

  if (password === storedPass) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
}

/**
 * 🧑‍🔧 PUT: Change or create new password
 * (Use only if already logged in or on first setup)
 */
export async function PUT(req: Request) {
  const { currentPassword, newPassword } = await req.json();

  let storedPass = process.env.ADMIN_PASS;
  if (fs.existsSync(PASS_FILE)) {
    const data = JSON.parse(fs.readFileSync(PASS_FILE, "utf8"));
    storedPass = data.password;
  }

  if (storedPass && storedPass !== currentPassword) {
    return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 401 });
  }

  fs.writeFileSync(PASS_FILE, JSON.stringify({ password: newPassword }, null, 2));
  return NextResponse.json({ success: true, message: "Password updated successfully!" });
}
