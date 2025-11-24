import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** ---------------------------------------------------------
 * GET /api/units?year=Year 1&semester=1&search=text
 * POST { year, semester, search }
 --------------------------------------------------------- */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const year = searchParams.get("year");
  const semesterRaw = searchParams.get("semester");
  const search = searchParams.get("search");

  const semester = semesterRaw ? Number(semesterRaw) : null;

  return fetchUnits({ year, semester, search });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const year = body.year || null;
    const semester = body.semester ? Number(body.semester) : null;
    const search = body.search || null;

    return fetchUnits({ year, semester, search });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Invalid JSON", details: err.message },
      { status: 400 }
    );
  }
}

/** ---------------------------------------------------------
 * Main logic for fetching units
 --------------------------------------------------------- */

async function fetchUnits({
  year,
  semester,
  search,
}: {
  year?: string | null;
  semester?: number | null;
  search?: string | null;
}) {
  let query = supabaseAdmin
    .from("units")
    .select("id, year, semester, name");

  // Filter by year
  if (year) query = query.eq("year", year);

  // Filter by semester
  if (semester) query = query.eq("semester", semester);

  // Search filter
  if (search && search.trim() !== "") {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query.order("name", { ascending: true });

  if (error) {
    console.error("❌ Units fetch error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ units: data || [] });
}
