import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();
  const valid = password === process.env.ADMIN_PASS;
  if (valid) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false }, { status: 401 });
}
