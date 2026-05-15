import "server-only";

import Stripe from "stripe";

import { env } from "@/env.mjs";

const globalForStripe = globalThis as unknown as { stripe: Stripe | undefined };

export const stripe =
  globalForStripe.stripe ??
  new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
    typescript: true,
    appInfo: { name: "khoidoanh-ai", version: "0.1.0" },
  });

if (env.NODE_ENV !== "production") globalForStripe.stripe = stripe;
