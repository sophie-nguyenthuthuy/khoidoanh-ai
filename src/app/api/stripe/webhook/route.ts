import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { env } from "@/env.mjs";
import { db, payments, registrations, subscriptions } from "@/lib/db";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/stripe/client";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.warn({ err }, "Stripe webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await handleEvent(event);
  } catch (err) {
    logger.error({ err, eventType: event.type, eventId: event.id }, "Webhook handler failure");
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, productCode, registrationId } = session.metadata ?? {};
      if (!userId) return;

      await db.insert(payments).values({
        userId,
        registrationId: registrationId || null,
        stripePaymentIntentId: (session.payment_intent as string) ?? null,
        stripeInvoiceId: (session.invoice as string) ?? null,
        amountVnd: session.amount_total ?? 0,
        currency: (session.currency ?? "vnd").toUpperCase(),
        status: "succeeded",
        description: productCode ?? null,
        receiptUrl: null,
        metadata: { sessionId: session.id, productCode },
      });

      if (registrationId) {
        await db
          .update(registrations)
          .set({ status: "SUBMITTING" })
          .where(eq(registrations.id, registrationId));
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = (sub.metadata?.userId as string) ?? null;
      if (!userId) return;
      await db
        .insert(subscriptions)
        .values({
          userId,
          plan: (sub.metadata?.plan as never) ?? "TAX_BASIC",
          status: mapStatus(sub.status),
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items.data[0]?.price.id,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        })
        .onConflictDoUpdate({
          target: subscriptions.stripeSubscriptionId,
          set: {
            status: mapStatus(sub.status),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await db
        .update(subscriptions)
        .set({ status: "CANCELLED", cancelledAt: new Date() })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id));
      break;
    }
    default:
      logger.debug({ type: event.type }, "Unhandled Stripe event");
  }
}

function mapStatus(s: Stripe.Subscription.Status) {
  switch (s) {
    case "active":
      return "ACTIVE" as const;
    case "trialing":
      return "TRIALING" as const;
    case "past_due":
    case "unpaid":
      return "PAST_DUE" as const;
    case "canceled":
      return "CANCELLED" as const;
    default:
      return "EXPIRED" as const;
  }
}
