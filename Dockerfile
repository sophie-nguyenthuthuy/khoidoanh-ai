# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ─── Deps ────────────────────────────────────────────────────────────
FROM base AS deps
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# ─── Build ───────────────────────────────────────────────────────────
FROM base AS builder
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1
# Build-time placeholder secrets: `next build` traces every route to
# collect page data, which instantiates the Stripe client at module load
# of `app/api/stripe/webhook/route.ts`. Without a (well-formed) secret
# the Stripe SDK throws and the whole build fails. These values are
# discarded at runtime — operators inject real secrets via .env.local.
ENV STRIPE_SECRET_KEY=sk_test_buildtime_placeholder
ENV STRIPE_WEBHOOK_SECRET=whsec_buildtime_placeholder
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_buildtime_placeholder
ENV AUTH_SECRET=buildtime-auth-secret-at-least-32-chars-long
ENV DATABASE_URL=postgresql://placeholder:placeholder@buildtime.invalid:5432/placeholder
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV UPSTASH_REDIS_REST_URL=https://placeholder.invalid
ENV UPSTASH_REDIS_REST_TOKEN=placeholder
RUN pnpm build

# ─── Runner ──────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -q --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
