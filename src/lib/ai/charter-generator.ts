import "server-only";

import { z } from "zod";

import { db, aiGenerations } from "@/lib/db";

import { complete, estimateCostUsd, type LlmCompletion, MODEL } from "./client";
import {
  buildCharterPrompt,
  CHARTER_PROMPT_VERSION,
  CHARTER_SYSTEM_PROMPT,
  type CharterPromptInput,
} from "./prompts/charter";

const charterArticleSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().min(1),
  content: z.string().min(1),
});

const charterChapterSchema = z.object({
  title: z.string().min(1),
  articles: z.array(charterArticleSchema).min(1),
});

export const charterOutputSchema = z.object({
  title: z.string().min(1),
  preamble: z.string().min(1),
  chapters: z.array(charterChapterSchema).min(3),
  signature_block: z.string().min(1),
  legal_references: z.array(z.string()).min(1),
});

export type CharterOutput = z.infer<typeof charterOutputSchema>;

export interface GenerateCharterOptions {
  userId?: string;
  registrationId?: string;
}

export async function generateCharter(
  input: CharterPromptInput,
  options: GenerateCharterOptions = {},
): Promise<{ charter: CharterOutput; promptVersion: string; model: string }> {
  const started = Date.now();

  const response = await complete({
    system: CHARTER_SYSTEM_PROMPT,
    user: buildCharterPrompt(input),
    maxTokens: 16_000,
    jsonMode: true,
  });

  const latencyMs = Date.now() - started;
  const rawText = response.text;

  let parsed: CharterOutput;
  try {
    const json = extractJson(rawText);
    parsed = charterOutputSchema.parse(json);
  } catch (err) {
    await logGeneration({
      ...options,
      latencyMs,
      response,
      input,
      error: `Parse failure: ${(err as Error).message}`,
    });
    throw new CharterGenerationError("AI output failed schema validation", {
      cause: err,
      rawText,
    });
  }

  await logGeneration({ ...options, latencyMs, response, input, output: parsed });

  return { charter: parsed, promptVersion: CHARTER_PROMPT_VERSION, model: MODEL };
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const body = fenced ? fenced[1] : trimmed;
  if (!body) throw new Error("Empty AI output");
  return JSON.parse(body);
}

async function logGeneration(args: {
  userId?: string;
  registrationId?: string;
  latencyMs: number;
  response: LlmCompletion;
  input: CharterPromptInput;
  output?: CharterOutput;
  error?: string;
}) {
  const usage = args.response.usage;
  await db.insert(aiGenerations).values({
    userId: args.userId,
    registrationId: args.registrationId,
    purpose: "charter",
    model: MODEL,
    promptVersion: CHARTER_PROMPT_VERSION,
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    cacheReadTokens: usage.cache_read_input_tokens ?? 0,
    cacheCreationTokens: usage.cache_creation_input_tokens ?? 0,
    latencyMs: args.latencyMs,
    costUsd: Math.round(estimateCostUsd(MODEL, usage) * 1_000_000),
    input: args.input as unknown as Record<string, unknown>,
    output: args.output as unknown as Record<string, unknown> | undefined,
    error: args.error,
  });
}

export class CharterGenerationError extends Error {
  rawText?: string;
  constructor(message: string, opts: { cause?: unknown; rawText?: string } = {}) {
    super(message, { cause: opts.cause });
    this.name = "CharterGenerationError";
    this.rawText = opts.rawText;
  }
}
