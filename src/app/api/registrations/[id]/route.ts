import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import { getRegistration } from "@/server/services/registration-service";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const reg = await getRegistration(id, session.user.id);
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(reg);
}
