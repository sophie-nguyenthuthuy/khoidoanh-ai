import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth/config";
import { createCheckoutSession } from "@/lib/stripe/checkout";

export const runtime = "nodejs";

const bodySchema = z.object({
  productCode: z.enum([
    "REGISTRATION_LLC",
    "REGISTRATION_JSC",
    "REGISTRATION_HOUSEHOLD",
    "TAX_BASIC",
    "TAX_PRO",
    "EINVOICE",
    "BHXH",
  ]),
  registrationId: z.string().uuid().optional(),
  quantity: z.number().int().positive().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = bodySchema.parse(await req.json());
  const checkout = await createCheckoutSession({
    userId: session.user.id,
    ...body,
  });

  return NextResponse.json({ url: checkout.url });
}
