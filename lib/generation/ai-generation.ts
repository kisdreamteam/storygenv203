import type { CharacterProfileMap } from "@/lib/character-profiles";

import { formatTopicFirstPlanForPrompt } from "@/lib/story/weekly-plan";

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

  isRepairableWeekStructureFailure,

  validateGenerationOutputWithWeeks,
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



function validateOutput(raw: unknown, inputs: StoryInputs) {
  return validateGenerationOutputWithWeeks(raw, inputs);
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



function buildWeekLanguageRepairPrompt(
  parsed: unknown,
  inputs: StoryInputs,
  reason: string
): string {
  return `The story JSON below failed validation: ${reason}

${formatTopicFirstPlanForPrompt(inputs.theme, inputs.learning_goal, inputs.weeklyPlan)}

Repair instructions:
- Remove ALL week planning language from page text (no "week 1", "first week", "second week", etc.)
- Weeks are internal teacher planning only — students read a continuous story
- Preserve story meaning, all 12 pages, title, vocabulary, illustration_scene fields, and inferred_weekly_plan
- Return the complete corrected JSON object only.

Story JSON:
${JSON.stringify(parsed)}`;
}



async function tryRepairShortPages(

  parsed: unknown,

  shortPages: number[],

  apiKey: string,

  model: string,

  profiles: CharacterProfileMap,

  inputs: StoryInputs

): Promise<unknown | null> {

  for (let attempt = 0; attempt < 2; attempt++) {

    const response = await requestChatCompletion(apiKey, model, [

      { role: "system", content: buildSystemPrompt(profiles, inputs) },

      { role: "user", content: buildShortPageRepairPrompt(parsed, shortPages) },

    ]);



    if (!response.ok) {

      continue;

    }



    try {

      return parseJsonContent(response.content);

    } catch {

      // retry once on invalid repair JSON

    }

  }



  return null;

}



async function tryRepairWeekAdherence(

  parsed: unknown,

  reason: string,

  apiKey: string,

  model: string,

  profiles: CharacterProfileMap,

  inputs: StoryInputs

): Promise<unknown | null> {

  const response = await requestChatCompletion(apiKey, model, [

    { role: "system", content: buildSystemPrompt(profiles, inputs) },

    { role: "user", content: buildWeekLanguageRepairPrompt(parsed, inputs, reason) },

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

  profiles: CharacterProfileMap,

  inputs: StoryInputs

): Promise<AiGenerationResult> {

  let current = parsed;



  for (let pass = 0; pass < 4; pass++) {

    const validated = validateOutput(current, inputs);

    if (validated.ok) {

      return { ok: true, result: validated.result };

    }



    const reason = validated.reason;



    if (isRepairableShortPageFailure(current)) {

      const shortPages = getShortPageNumbers(current);

      const repaired = await tryRepairShortPages(

        current,

        shortPages,

        apiKey,

        model,

        profiles,

        inputs

      );

      if (repaired) {

        current = repaired;

        continue;

      }

      return validationFailure(reason);

    }



    if (isRepairableWeekStructureFailure(current)) {

      const repaired = await tryRepairWeekAdherence(

        current,

        reason,

        apiKey,

        model,

        profiles,

        inputs

      );

      if (repaired) {

        current = repaired;

        continue;

      }

      return validationFailure(reason);

    }



    return validationFailure(reason);

  }



  const finalValidation = validateOutput(current, inputs);

  if (finalValidation.ok) {

    return { ok: true, result: finalValidation.result };

  }



  return validationFailure(finalValidation.reason);

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

    { role: "system", content: buildSystemPrompt(profiles, inputs) },

    { role: "user", content: buildUserPrompt(inputs, memory, options) },

  ]);



  if (!response.ok) {

    if (response.reason === "empty model response") {

      return validationFailure(response.reason);

    }

    return unavailableFailure(response.reason);

  }



  let parsed: unknown;

  try {

    parsed = parseJsonContent(response.content);

  } catch {

    return validationFailure("model returned invalid JSON");

  }



  return validateOrRepairAiOutput(parsed, apiKey, model, profiles, inputs);

}


