import { NextResponse } from "next/server";
import { z } from "zod";

import { suggestCompanyNames } from "@/lib/ai/company-name-generator";
import { auth } from "@/lib/auth/config";
import { aiRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  industryDescription: z.string().min(10).max(2_000),
  brandKeywords: z.array(z.string()).max(8).optional(),
  entityType: z.enum([
    "LLC_SINGLE",
    "LLC_MULTI",
    "JSC",
    "PARTNERSHIP",
    "PRIVATE",
    "HOUSEHOLD",
  ]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await aiRateLimit.limit(`name:${session.user.id}`);
  if (!success) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const input = bodySchema.parse(await req.json());
  const result = await suggestCompanyNames({ ...input, userId: session.user.id });
  return NextResponse.json(result);
}
