/**
 * Edge-safe Auth.js config — no Node imports.
 *
 * Why this file exists: Next.js bundles `middleware.ts` for the Edge
 * Runtime (V8-only, no `fs`, no `pg`, no `crypto`-Node bits). When the
 * full NextAuth config in `./config.ts` is reachable from middleware it
 * pulls in `@auth/drizzle-adapter` → `postgres` driver → Node-only
 * modules, and the edge sandbox refuses to evaluate the bundle. With a
 * production build the symptom is a `TypeError: Cannot redefine property:
 * __import_unsupported` on every request (middleware re-evaluates and
 * collides with the polyfill it installed on first eval).
 *
 * Auth.js v5 supports the split-config pattern: middleware imports this
 * minimal config (providers only, JWT session), API routes / server
 * actions import the full config from `./config.ts` (adapter + DB).
 * Both pass the same `authConfig` shape to `NextAuth()`, so session
 * cookies and JWT signing stay compatible across the two runtimes.
 *
 * https://authjs.dev/guides/upgrade-to-v5#edge-compatibility
 */
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=1",
  },
  providers: [
    // Edge-safe providers only. The Resend provider in ./config.ts uses
    // the adapter (it writes verification tokens to Postgres) so it must
    // not live here — credential email links flow through API routes that
    // run on the Node runtime.
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    // Only the `authorized` callback runs on the edge (middleware path).
    // Return true to let the request through, false to redirect to signIn.
    // We do the granular protected-prefix check in `src/middleware.ts` so
    // here we just gate by "is there any session at all".
    authorized({ auth }) {
      return true; // middleware does its own logic; never block at this layer.
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
