import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { type DefaultSession } from "next-auth";
import Resend from "next-auth/providers/resend";

import { env } from "@/env.mjs";
import { db, accounts, sessions, users, verificationTokens } from "@/lib/db";
import { authConfig } from "@/lib/auth/edge-config";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
    };
  }
}

// Full (Node-runtime) Auth.js config. Imports the edge-safe `authConfig`
// for shared bits (providers list, pages, callbacks.authorized) and adds
// the Drizzle adapter + Resend email provider — both of which require
// the postgres driver and therefore CANNOT live in edge-config.ts.
// See `src/middleware.ts` for why the split exists.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // The @auth/drizzle-adapter type bounds have drifted ahead of our pinned
  // drizzle-orm column types (PgUUID/PgText/PgTimestamp). Functionally the
  // tables match the adapter's expected schema; cast to `any` to bypass the
  // structural mismatch until both packages line up again.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  } as any),
  session: { strategy: "database" },
  providers: [
    ...authConfig.providers,
    ...(env.RESEND_API_KEY
      ? [Resend({ apiKey: env.RESEND_API_KEY, from: env.EMAIL_FROM })]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = (user as { role?: string }).role ?? "customer";
      return session;
    },
  },
});
