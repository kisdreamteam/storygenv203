import { injectIllustrationContinuityIntoPages } from "./character-continuity";
import { DEFAULT_ILLUSTRATION_SETTING } from "./illustration-prompt";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import type { MockGenerationResult, SeriesMemorySummary, StoryInputs } from "./types";
import { validateGenerationOutput } from "./validate-output";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 90_000;

export type AiGenerationResult =
  | { ok: true; result: MockGenerationResult }
  | { ok: false; reason: string };

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

export async function tryAiGeneration(
  inputs: StoryInputs,
  memory: SeriesMemorySummary
): Promise<AiGenerationResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, reason: "OPENAI_API_KEY not configured" };
  }

  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
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
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(inputs, memory) },
        ],
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

    let parsed: unknown;
    try {
      parsed = parseJsonContent(content);
    } catch {
      return { ok: false, reason: "model returned invalid JSON" };
    }

    const validated = validateGenerationOutput(parsed);
    if (!validated.ok) {
      return { ok: false, reason: `validation failed: ${validated.reason}` };
    }

    const setting = inputs.setting?.trim() || DEFAULT_ILLUSTRATION_SETTING;
    const pages = injectIllustrationContinuityIntoPages(validated.result.pages, setting);

    return {
      ok: true,
      result: {
        ...validated.result,
        pages,
      },
    };
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
