import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth/edge-config";

// IMPORTANT: middleware imports the *edge* auth config only — no DB
// adapter, no postgres driver. See `src/lib/auth/edge-config.ts` header
// for the full rationale (TL;DR: pulling DrizzleAdapter into the edge
// sandbox blows up with `Cannot redefine property: __import_unsupported`
// on the second evaluation, which makes every request 500 in prod).
const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = ["/dashboard", "/wizard", "/api/registrations", "/api/ai"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();
  if (req.auth) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
