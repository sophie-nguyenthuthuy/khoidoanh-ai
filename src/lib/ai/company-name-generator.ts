import "server-only";

import { z } from "zod";

import { aiGenerations, db } from "@/lib/db";

import { complete, estimateCostUsd, MODEL } from "./client";
import {
  COMPANY_NAME_PROMPT_VERSION,
  COMPANY_NAME_SYSTEM_PROMPT,
} from "./prompts/company-name";

export const companyNameOutputSchema = z.object({
  suggestions: z
    .array(
      z.object({
        fullNameVi: z.string().min(1),
        fullNameEn: z.string().min(1),
        abbreviation: z.string().min(1),
        rationale: z.string().min(1),
      }),
    )
    .min(3)
    .max(10),
});

export type CompanyNameOutput = z.infer<typeof companyNameOutputSchema>;

export interface CompanyNameInput {
  industryDescription: string;
  brandKeywords?: string[];
  entityType:
    | "LLC_SINGLE"
    | "LLC_MULTI"
    | "JSC"
    | "PARTNERSHIP"
    | "PRIVATE"
    | "HOUSEHOLD";
  userId?: string;
}

export async function suggestCompanyNames(input: CompanyNameInput): Promise<CompanyNameOutput> {
  const started = Date.now();

  const entityPrefix: Record<CompanyNameInput["entityType"], string> = {
    LLC_SINGLE: "Công ty TNHH",
    LLC_MULTI: "Công ty TNHH",
    JSC: "Công ty Cổ phần",
    PARTNERSHIP: "Công ty Hợp danh",
    PRIVATE: "Doanh nghiệp Tư nhân",
    HOUSEHOLD: "Hộ kinh doanh",
  };

  const userPrompt = [
    `Loại hình: ${entityPrefix[input.entityType]}`,
    `Ngành nghề / mô tả:`,
    input.industryDescription,
    input.brandKeywords?.length
      ? `Từ khoá thương hiệu founder thích: ${input.brandKeywords.join(", ")}`
      : "",
    ``,
    `Đề xuất 5-8 phương án tên. JSON, không markdown wrapper.`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await complete({
    system: COMPANY_NAME_SYSTEM_PROMPT,
    user: userPrompt,
    maxTokens: 2_000,
    jsonMode: true,
  });

  const latencyMs = Date.now() - started;
  const rawText = response.text;
  const fenced = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const parsed = companyNameOutputSchema.parse(JSON.parse(fenced ? fenced[1]! : rawText.trim()));

  await db.insert(aiGenerations).values({
    userId: input.userId,
    purpose: "company_name",
    model: MODEL,
    promptVersion: COMPANY_NAME_PROMPT_VERSION,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
    cacheCreationTokens: response.usage.cache_creation_input_tokens ?? 0,
    latencyMs,
    costUsd: Math.round(estimateCostUsd(MODEL, response.usage) * 1_000_000),
    input: input as unknown as Record<string, unknown>,
    output: parsed as unknown as Record<string, unknown>,
  });

  return parsed;
}
