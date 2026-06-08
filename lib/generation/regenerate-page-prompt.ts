import {
  CHARACTER_BIBLE_EXCERPT,
  TIER1_CHARACTER_RULES,
} from "@/lib/constants/character-bible";
import {
  ILLUSTRATION_PROMPT_FORMAT,
  ILLUSTRATION_STYLE_SUFFIX,
} from "@/lib/constants/illustration-style";
import { LOCKED_ILLUSTRATION_SUFFIX } from "./character-continuity";
import { buildIllustrationPromptFromPageText } from "./illustration-prompt";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 30_000;

export type RegeneratePagePromptInput = {
  pageText: string;
  pageNumber: number;
  setting: string | null;
  theme: string;
};

export type RegeneratePagePromptResult = {
  illustration_prompt: string;
  warning: string | null;
};

function sanitizeReason(message: string): string {
  return message
    .replace(/sk-[a-zA-Z0-9_-]+/g, "[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function buildPagePromptSystemMessage(): string {
  return `You write a single illustration prompt for one page of a Nina & Nino children's story (ages 4–6).

${CHARACTER_BIBLE_EXCERPT}

Illustration prompts — ${TIER1_CHARACTER_RULES}
${ILLUSTRATION_PROMPT_FORMAT}

Output rules (strict):
- Return ONLY valid JSON: { "illustration_prompt": "string" }
- One paragraph, copy-ready, depicting the primary visual moment of the page text.
- Include ONLY locked character descriptors for characters mentioned on this page.
- Include the full locked continuity suffix: ${ILLUSTRATION_STYLE_SUFFIX}
- Use 16:9 landscape zoomed-out full-body framing with space for educational text overlays.
- Classroom-safe; no text, speech bubbles, labels, or watermarks in image.`;
}

function buildPagePromptUserMessage(input: RegeneratePagePromptInput): string {
  const setting = input.setting?.trim() || "Sunny Grove Kindergarten neighborhood";
  return `Story theme: ${input.theme}
Page number: ${input.pageNumber}
Setting: ${setting}

Page text:
${input.pageText.trim()}

Write one illustration_prompt for this page.`;
}

function validatePagePrompt(prompt: string): { ok: true } | { ok: false; reason: string } {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return { ok: false, reason: "empty illustration_prompt" };
  }
  if (!trimmed.includes(LOCKED_ILLUSTRATION_SUFFIX)) {
    return { ok: false, reason: "missing locked illustration continuity suffix" };
  }
  return { ok: true };
}

async function tryAiPagePrompt(
  input: RegeneratePagePromptInput
): Promise<{ ok: true; illustration_prompt: string } | { ok: false; reason: string }> {
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
          { role: "system", content: buildPagePromptSystemMessage() },
          { role: "user", content: buildPagePromptUserMessage(input) },
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
        // ignore
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
      parsed = JSON.parse(content.trim());
    } catch {
      return { ok: false, reason: "model returned invalid JSON" };
    }

    const prompt =
      typeof (parsed as { illustration_prompt?: unknown })?.illustration_prompt ===
      "string"
        ? (parsed as { illustration_prompt: string }).illustration_prompt.trim()
        : "";

    const validated = validatePagePrompt(prompt);
    if (!validated.ok) {
      return { ok: false, reason: validated.reason };
    }

    return { ok: true, illustration_prompt: prompt };
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

export async function regeneratePageIllustrationPrompt(
  input: RegeneratePagePromptInput
): Promise<RegeneratePagePromptResult> {
  const setting = input.setting?.trim() || "";

  const ai = await tryAiPagePrompt(input);
  if (ai.ok) {
    return { illustration_prompt: ai.illustration_prompt, warning: null };
  }

  const illustration_prompt = buildIllustrationPromptFromPageText(
    input.pageText,
    input.pageNumber,
    setting
  );

  return {
    illustration_prompt,
    warning: `AI prompt regeneration unavailable (${ai.reason}). Using template prompt.`,
  };
}
