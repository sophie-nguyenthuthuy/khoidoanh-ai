// Hand-written declaration mirroring the runtime shape of `src/env.mjs`.
// `env.mjs` stays a `.mjs` so Next.js + drizzle-kit + tsx pick it up at
// bootstrap (before TS compilation runs). This declaration lets the TS
// compiler resolve `import { env } from "@/env.mjs"` from every other module.

declare module "@/env.mjs" {
  export const env: {
    readonly NODE_ENV: "development" | "test" | "production";
    readonly DATABASE_URL: string;
    readonly DIRECT_URL: string | undefined;
    readonly AUTH_SECRET: string;
    readonly AUTH_URL: string | undefined;
    readonly AUTH_GOOGLE_ID: string | undefined;
    readonly AUTH_GOOGLE_SECRET: string | undefined;
    readonly LLM_BASE_URL: string;
    readonly LLM_API_KEY: string | undefined;
    readonly LLM_MODEL: string;
    readonly STRIPE_SECRET_KEY: string;
    readonly STRIPE_WEBHOOK_SECRET: string;
    readonly UPSTASH_REDIS_REST_URL: string;
    readonly UPSTASH_REDIS_REST_TOKEN: string;
    readonly RESEND_API_KEY: string | undefined;
    readonly EMAIL_FROM: string;
    readonly BLOB_READ_WRITE_TOKEN: string | undefined;
    readonly SENTRY_DSN: string | undefined;
    readonly DKKD_NATIONAL_PORTAL_API_KEY: string | undefined;
    readonly NEXT_PUBLIC_APP_URL: string;
    readonly NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
    readonly NEXT_PUBLIC_POSTHOG_KEY: string | undefined;
    readonly NEXT_PUBLIC_POSTHOG_HOST: string | undefined;
  };
}

// Relative-import variants used by `drizzle.config.ts`, `scripts/*`, etc.
declare module "./src/env.mjs" {
  export { env } from "@/env.mjs";
}
declare module "../src/env.mjs" {
  export { env } from "@/env.mjs";
}
