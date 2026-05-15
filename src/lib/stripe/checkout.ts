import "server-only";

import { eq } from "drizzle-orm";

import { env } from "@/env.mjs";
import { db, users } from "@/lib/db";

import { stripe } from "./client";
import { PRODUCTS, type ProductCode } from "./products";

export async function getOrCreateCustomer(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("User not found");
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { userId },
  });
  await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, userId));
  return customer.id;
}

export interface CreateCheckoutInput {
  userId: string;
  productCode: ProductCode;
  registrationId?: string;
  quantity?: number;
}

export async function createCheckoutSession(input: CreateCheckoutInput) {
  const product = PRODUCTS[input.productCode];
  const customerId = await getOrCreateCustomer(input.userId);

  const successUrl = `${env.NEXT_PUBLIC_APP_URL}/wizard/new/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${env.NEXT_PUBLIC_APP_URL}/wizard/new/checkout?cancelled=1`;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: product.type === "subscription" ? "subscription" : "payment",
    line_items: [
      {
        price_data: {
          currency: "vnd",
          unit_amount: product.priceVnd,
          product_data: { name: product.label, description: product.description },
          ...(product.type === "subscription" && {
            recurring: { interval: "month" as const },
          }),
        },
        quantity: input.quantity ?? 1,
      },
    ],
    metadata: {
      userId: input.userId,
      productCode: input.productCode,
      registrationId: input.registrationId ?? "",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    locale: "auto",
  });

  return session;
}
