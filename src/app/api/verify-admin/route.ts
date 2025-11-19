import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // Example admin validation logic
    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
      return NextResponse.json({ success: true, message: "Admin verified" });
    }

    return NextResponse.json(
      { success: false, message: "Invalid admin credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error("verify-admin error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
