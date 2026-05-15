import "server-only";

import { and, eq, ilike, inArray, or, sql } from "drizzle-orm";

import { businessCodes, db } from "@/lib/db";

export interface BusinessCodeSearchResult {
  code: string;
  name: string;
  description: string | null;
  isConditional: boolean;
  conditionalNote: string | null;
}

export async function searchBusinessCodes(
  query: string,
  limit = 20,
): Promise<BusinessCodeSearchResult[]> {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const rows = await db
    .select({
      code: businessCodes.code,
      name: businessCodes.name,
      description: businessCodes.description,
      isConditional: businessCodes.isConditional,
      conditionalNote: businessCodes.conditionalNote,
    })
    .from(businessCodes)
    .where(
      and(
        eq(businessCodes.level, 4),
        or(
          ...tokens.flatMap((t) => [
            ilike(businessCodes.name, `%${t}%`),
            ilike(businessCodes.description, `%${t}%`),
          ]),
        ) ?? sql`true`,
      ),
    )
    .limit(limit);

  return rows;
}

export async function getBusinessCodeByCode(
  code: string,
): Promise<BusinessCodeSearchResult | null> {
  const [row] = await db
    .select({
      code: businessCodes.code,
      name: businessCodes.name,
      description: businessCodes.description,
      isConditional: businessCodes.isConditional,
      conditionalNote: businessCodes.conditionalNote,
    })
    .from(businessCodes)
    .where(eq(businessCodes.code, code))
    .limit(1);
  return row ?? null;
}

export async function getBusinessCodesByCodes(
  codes: string[],
): Promise<BusinessCodeSearchResult[]> {
  if (codes.length === 0) return [];
  return db
    .select({
      code: businessCodes.code,
      name: businessCodes.name,
      description: businessCodes.description,
      isConditional: businessCodes.isConditional,
      conditionalNote: businessCodes.conditionalNote,
    })
    .from(businessCodes)
    .where(inArray(businessCodes.code, codes));
}

function tokenize(input: string): string[] {
  return Array.from(
    new Set(
      input
        .toLowerCase()
        .normalize("NFC")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 2),
    ),
  ).slice(0, 8);
}
