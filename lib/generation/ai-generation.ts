import type { CharacterProfileMap } from "@/lib/character-profiles";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import type {
  GenerationOptions,
  MockGenerationResult,
  SeriesMemorySummary,
  StoryInputs,
} from "./types";
import {
  getShortPageNumbers,
  isRepairableShortPageFailure,
  validateGenerationOutput,
} from "./validate-output";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 90_000;

export type AiGenerationFailureKind = "validation" | "unavailable";

export type AiGenerationResult =
  | { ok: true; result: MockGenerationResult }
  | { ok: false; reason: string; failureKind: AiGenerationFailureKind };

type ChatMessage = { role: "system" | "user"; content: string };

function sanitizeReason(message: string): string {
  return message
    .replace(/sk-[a-zA-Z0-9_-]+/g, "[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function parseJsonContent(content: string): unknown {
  const trimmed = content.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(withoutFence);
}

async function requestChatCompletion(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<{ ok: true; content: string } | { ok: false; reason: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const errBody = await response.json();
        const apiMessage =
          typeof errBody?.error?.message === "string" ? errBody.error.message : "";
        if (apiMessage) detail = `${detail}: ${sanitizeReason(apiMessage)}`;
      } catch {
        // ignore parse errors on error body
      }
      return { ok: false, reason: detail };
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      return { ok: false, reason: "empty model response" };
    }

    return { ok: true, content };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, reason: "request timed out" };
    }
    const message = err instanceof Error ? err.message : "unknown error";
    return { ok: false, reason: sanitizeReason(message) };
  } finally {
    clearTimeout(timeout);
  }
}

function buildShortPageRepairPrompt(parsed: unknown, shortPages: number[]): string {
  const pageList = shortPages.join(", ");
  return `The story JSON below failed validation because page(s) ${pageList} have too few words.

Expand ONLY the "text" field on those page(s) so each has 25–55 words. Preserve meaning, age level (4–6), vocabulary integration, page numbers, illustration_scene fields, title, and all other pages unchanged. Do not pad with filler.

Return the complete corrected JSON object only.

Story JSON:
${JSON.stringify(parsed)}`;
}

async function tryRepairShortPages(
  parsed: unknown,
  shortPages: number[],
  apiKey: string,
  model: string,
  profiles: CharacterProfileMap
): Promise<unknown | null> {
  const response = await requestChatCompletion(apiKey, model, [
    { role: "system", content: buildSystemPrompt(profiles) },
    { role: "user", content: buildShortPageRepairPrompt(parsed, shortPages) },
  ]);

  if (!response.ok) {
    return null;
  }

  try {
    return parseJsonContent(response.content);
  } catch {
    return null;
  }
}

function validationFailure(reason: string): AiGenerationResult {
  return { ok: false, reason: `validation failed: ${reason}`, failureKind: "validation" };
}

function unavailableFailure(reason: string): AiGenerationResult {
  return { ok: false, reason, failureKind: "unavailable" };
}

async function validateOrRepairAiOutput(
  parsed: unknown,
  apiKey: string,
  model: string,
  profiles: CharacterProfileMap
): Promise<AiGenerationResult> {
  const validated = validateGenerationOutput(parsed);
  if (validated.ok) {
    return { ok: true, result: validated.result };
  }

  if (!isRepairableShortPageFailure(parsed)) {
    return validationFailure(validated.reason);
  }

  const shortPages = getShortPageNumbers(parsed);
  const repaired = await tryRepairShortPages(parsed, shortPages, apiKey, model, profiles);
  if (!repaired) {
    return validationFailure(validated.reason);
  }

  const repairedValidation = validateGenerationOutput(repaired);
  if (repairedValidation.ok) {
    return { ok: true, result: repairedValidation.result };
  }

  return validationFailure(repairedValidation.reason);
}

export async function tryAiGeneration(
  inputs: StoryInputs,
  memory: SeriesMemorySummary,
  profiles: CharacterProfileMap,
  options?: GenerationOptions
): Promise<AiGenerationResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return unavailableFailure("OPENAI_API_KEY not configured");
  }

  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  const response = await requestChatCompletion(apiKey, model, [
    { role: "system", content: buildSystemPrompt(profiles) },
    { role: "user", content: buildUserPrompt(inputs, memory, options) },
  ]);

  if (!response.ok) {
    return unavailableFailure(response.reason);
  }

  let parsed: unknown;
  try {
    parsed = parseJsonContent(response.content);
  } catch {
    return unavailableFailure("model returned invalid JSON");
  }

  return validateOrRepairAiOutput(parsed, apiKey, model, profiles);
}
