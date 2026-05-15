import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth/config";
import { generateCharterAction } from "@/server/actions/registration-actions";
import { aiRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 120;

const bodySchema = z.object({ registrationId: z.string().uuid() });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await aiRateLimit.limit(`charter-api:${session.user.id}`);
  if (!success) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const { registrationId } = bodySchema.parse(await req.json());

  try {
    await generateCharterAction(registrationId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 },
    );
  }
}
