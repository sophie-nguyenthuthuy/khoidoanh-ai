import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ status: "ok", db: "up", time: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { status: "degraded", db: "down", error: err instanceof Error ? err.message : "unknown" },
      { status: 503 },
    );
  }
}
