import "server-only";

import { redirect } from "next/navigation";

import { auth } from "./config";

export { auth, signIn, signOut, handlers } from "./config";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(role: string) {
  const session = await requireAuth();
  if (session.user.role !== role) redirect("/dashboard");
  return session;
}
