import "server-only";

import { and, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";

import { aiGenerations, businessCodes, db } from "@/lib/db";

import { complete, estimateCostUsd, MODEL } from "./client";
import {
  buildBusinessCodesPrompt,
  BUSINESS_CODES_PROMPT_VERSION,
  BUSINESS_CODES_SYSTEM_PROMPT,
  type BusinessCodesPromptInput,
} from "./prompts/business-codes";

const recommendationSchema = z.object({
  code: z.string().regex(/^\d{4}$/),
  name: z.string().min(1),
  detail: z.string().min(1),
  isPrimary: z.boolean(),
  confidence: z.number().min(0).max(1),
  warnings: z.array(z.string()).default([]),
});

const warningSchema = z.object({
  severity: z.enum(["info", "warning", "error"]),
  message: z.string().min(1),
});

export const businessCodesOutputSchema = z.object({
  recommendations: z.array(recommendationSchema).min(1).max(10),
  warnings: z.array(warningSchema).default([]),
});

export type BusinessCodesOutput = z.infer<typeof businessCodesOutputSchema>;

export interface RecommendBusinessCodesInput {
  description: string;
  entityType: string;
  foreignInvestment?: boolean;
  userId?: string;
  registrationId?: string;
}

export async function recommendBusinessCodes(
  input: RecommendBusinessCodesInput,
): Promise<BusinessCodesOutput & { promptVersion: string; model: string }> {
  const started = Date.now();

  // Step 1: shortlist candidates from VSIC via keyword search.
  // (Future: replace with pgvector + embeddings on businessCodes.embedding.)
  const keywords = extractKeywords(input.description);
  const candidates = await db
    .select({
      code: businessCodes.code,
      name: businessCodes.name,
      isConditional: businessCodes.isConditional,
    })
    .from(businessCodes)
    .where(
      and(
        eq(businessCodes.level, 4),
        or(...keywords.map((k) => ilike(businessCodes.name, `%${k}%`))) ??
          sql`true`,
      ),
    )
    .limit(40);

  // Step 2: ask the OSS LLM to pick + write detail.
  const response = await complete({
    system: BUSINESS_CODES_SYSTEM_PROMPT,
    user: buildBusinessCodesPrompt({
      description: input.description,
      entityType: input.entityType,
      foreignInvestment: input.foreignInvestment,
      candidateCodes: candidates,
    } satisfies BusinessCodesPromptInput),
    maxTokens: 4_000,
    jsonMode: true,
  });

  const latencyMs = Date.now() - started;
  const json = extractJson(response.text);
  const parsed = businessCodesOutputSchema.parse(json);

  // Step 3: validate every recommended code actually exists in VSIC.
  const codes = parsed.recommendations.map((r) => r.code);
  const existing = await db
    .select({ code: businessCodes.code })
    .from(businessCodes)
    .where(or(...codes.map((c) => eq(businessCodes.code, c))) ?? sql`false`);
  const existingSet = new Set(existing.map((r) => r.code));
  parsed.recommendations = parsed.recommendations.filter((r) => existingSet.has(r.code));

  await db.insert(aiGenerations).values({
    userId: input.userId,
    registrationId: input.registrationId,
    purpose: "business_codes",
    model: MODEL,
    promptVersion: BUSINESS_CODES_PROMPT_VERSION,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
    cacheCreationTokens: response.usage.cache_creation_input_tokens ?? 0,
    latencyMs,
    costUsd: Math.round(estimateCostUsd(MODEL, response.usage) * 1_000_000),
    input: input as unknown as Record<string, unknown>,
    output: parsed as Record<string, unknown>,
  });

  return {
    ...parsed,
    promptVersion: BUSINESS_CODES_PROMPT_VERSION,
    model: MODEL,
  };
}

const STOPWORDS = new Set([
  "và",
  "hoặc",
  "của",
  "cho",
  "với",
  "tại",
  "trong",
  "các",
  "những",
  "là",
  "một",
  "có",
  "to",
  "and",
  "or",
  "the",
  "a",
  "an",
  "for",
  "of",
  "in",
]);

function extractKeywords(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !STOPWORDS.has(w)),
    ),
  ).slice(0, 8);
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return JSON.parse(fenced ? fenced[1]! : text.trim());
}
