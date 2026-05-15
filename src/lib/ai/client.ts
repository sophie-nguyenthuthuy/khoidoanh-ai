import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { env } from "@/env.mjs";

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined;
};

export const anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    maxRetries: 2,
    timeout: 120_000,
  });

if (env.NODE_ENV !== "production") globalForAnthropic.anthropic = anthropic;

export const MODEL = env.ANTHROPIC_MODEL;

// Per-1M-token prices (USD) — update when Anthropic changes pricing.
// Used only for cost tracking inside ai_generations rows.
export const PRICING_USD_PER_MTOK = {
  "claude-opus-4-7": { input: 15, output: 75, cacheWrite: 18.75, cacheRead: 1.5 },
  "claude-sonnet-4-6": { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  "claude-haiku-4-5-20251001": { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 },
} as const;

export function estimateCostUsd(
  model: string,
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number | null;
    cache_read_input_tokens?: number | null;
  },
): number {
  const p = PRICING_USD_PER_MTOK[model as keyof typeof PRICING_USD_PER_MTOK];
  if (!p) return 0;
  const M = 1_000_000;
  return (
    (usage.input_tokens * p.input) / M +
    (usage.output_tokens * p.output) / M +
    ((usage.cache_creation_input_tokens ?? 0) * p.cacheWrite) / M +
    ((usage.cache_read_input_tokens ?? 0) * p.cacheRead) / M
  );
}
