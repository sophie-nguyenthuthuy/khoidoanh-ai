import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth/config";
import { recommendBusinessCodes } from "@/lib/ai/business-code-recommender";
import { aiRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const bodySchema = z.object({
  description: z.string().min(20).max(2_000),
  entityType: z.string().min(2),
  foreignInvestment: z.boolean().optional(),
  registrationId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success: rateOk } = await aiRateLimit.limit(`bc:${session.user.id}`);
  if (!rateOk) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: "Invalid input", details: err }, { status: 400 });
  }

  try {
    const result = await recommendBusinessCodes({
      ...body,
      userId: session.user.id,
    });
    return NextResponse.json(result);
  } catch (err) {
    logger.error({ err, userId: session.user.id }, "Business-code recommendation failed");
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
