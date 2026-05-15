import "server-only";

import { and, desc, eq } from "drizzle-orm";

import {
  auditLogs,
  db,
  members as membersTable,
  registrations,
  type NewMember,
  type NewRegistration,
  type Registration,
} from "@/lib/db";
import { generateReferenceCode } from "@/lib/utils";

export async function createRegistration(
  userId: string,
  entityType: NewRegistration["entityType"],
): Promise<Registration> {
  const referenceCode = generateReferenceCode("KD");
  const [row] = await db
    .insert(registrations)
    .values({
      userId,
      entityType,
      referenceCode,
      status: "DRAFT",
      currentStep: 1,
    })
    .returning();

  await db.insert(auditLogs).values({
    userId,
    action: "CREATE",
    entity: "registration",
    entityId: row!.id,
  });

  return row!;
}

export async function getRegistration(
  id: string,
  userId: string,
): Promise<Registration | null> {
  const [row] = await db
    .select()
    .from(registrations)
    .where(and(eq(registrations.id, id), eq(registrations.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function getRegistrationWithMembers(id: string, userId: string) {
  const reg = await getRegistration(id, userId);
  if (!reg) return null;
  const members = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.registrationId, id));
  return { ...reg, members };
}

export async function listUserRegistrations(userId: string) {
  return db
    .select()
    .from(registrations)
    .where(eq(registrations.userId, userId))
    .orderBy(desc(registrations.createdAt));
}

export async function updateRegistration(
  id: string,
  userId: string,
  patch: Partial<NewRegistration>,
): Promise<Registration | null> {
  const [updated] = await db
    .update(registrations)
    .set(patch)
    .where(and(eq(registrations.id, id), eq(registrations.userId, userId)))
    .returning();

  if (updated) {
    await db.insert(auditLogs).values({
      userId,
      action: "UPDATE",
      entity: "registration",
      entityId: id,
      changes: Object.fromEntries(
        Object.entries(patch).map(([k, v]) => [k, { from: null, to: v }]),
      ) as never,
    });
  }
  return updated ?? null;
}

export async function setRegistrationMembers(
  registrationId: string,
  userId: string,
  members: Array<Omit<NewMember, "registrationId">>,
) {
  await db.transaction(async (tx) => {
    await tx
      .delete(membersTable)
      .where(eq(membersTable.registrationId, registrationId));
    if (members.length > 0) {
      await tx
        .insert(membersTable)
        .values(members.map((m) => ({ ...m, registrationId })));
    }
    await tx.insert(auditLogs).values({
      userId,
      action: "UPDATE",
      entity: "registration_members",
      entityId: registrationId,
    });
  });
}

export async function advanceStep(
  id: string,
  userId: string,
  toStep: number,
): Promise<Registration | null> {
  return updateRegistration(id, userId, { currentStep: toStep });
}
