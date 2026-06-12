import "server-only";

import { env } from "@/env.mjs";

// All LLM access goes through this module. Backed by an OpenAI-compatible
// OSS endpoint (Ollama in dev, vLLM / SGLang in production). Default model
// is Qwen 2.5 (Apache-2.0) — strong on Vietnamese legal prose, JSON-mode
// reliable, can be self-hosted inside a VN IDC for data sovereignty.
//
// The surface intentionally mirrors the relevant slice of Anthropic's API so
// the three call sites (charter, business-codes, company-name generators)
// remained a one-token swap on rewire.

export const MODEL = env.LLM_MODEL;

export interface LlmUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

export interface LlmCompletion {
  text: string;
  usage: LlmUsage;
  model: string;
}

export interface CompleteArgs {
  system: string;
  user: string;
  maxTokens: number;
  temperature?: number;
  jsonMode?: boolean;
}

export async function complete(args: CompleteArgs): Promise<LlmCompletion> {
  const baseUrl = env.LLM_BASE_URL.replace(/\/$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(env.LLM_API_KEY ? { authorization: `Bearer ${env.LLM_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: args.maxTokens,
        temperature: args.temperature ?? 0.2,
        ...(args.jsonMode ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: args.system },
          { role: "user", content: args.user },
        ],
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`LLM endpoint ${res.status}: ${body.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: { message: { content: string } }[];
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      prompt_tokens_details?: { cached_tokens?: number };
    };
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  const usage = data.usage ?? {};

  return {
    text,
    usage: {
      input_tokens: usage.prompt_tokens ?? 0,
      output_tokens: usage.completion_tokens ?? 0,
      cache_read_input_tokens: usage.prompt_tokens_details?.cached_tokens ?? 0,
      cache_creation_input_tokens: 0,
    },
    model: MODEL,
  };
}

// Cost tracking. Self-hosted models have no per-token bill, but the
// `ai_generations` rows still record a USD figure for parity with prior
// data and for cross-tenant cost attribution when an operator runs on
// shared GPU infrastructure. Override `LLM_PRICING_USD_PER_MTOK_*` in env
// if you want amortised-GPU pricing baked in.
const COST_INPUT_USD = Number(process.env.LLM_PRICING_USD_PER_MTOK_INPUT ?? "0");
const COST_OUTPUT_USD = Number(process.env.LLM_PRICING_USD_PER_MTOK_OUTPUT ?? "0");

export function estimateCostUsd(_model: string, usage: LlmUsage): number {
  const M = 1_000_000;
  return (
    (usage.input_tokens * COST_INPUT_USD) / M +
    (usage.output_tokens * COST_OUTPUT_USD) / M
  );
}
