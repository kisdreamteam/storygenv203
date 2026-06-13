import type { StoryInputs } from "./types";
import {
  formatStoryShapeHint,
  SUGGEST_VARIETY_GUIDANCE,
} from "./story-variety";
import {
  formatCharacterHintsForSuggestPlan,
  formatCharacterNamesForText,
  getSupportingCharacterDisplayNames,
  hasExtendedCharacterCast,
} from "@/lib/story/character-hints";
import {
  emptyWeeklyPlan,
  isCompleteWeeklyPlan,
  mergeWeeklyPlans,
  normalizeWeeklyPlan,
  WEEK_PLAN_KEYS,
  type WeeklyPlan,
  type WeeklyPlanKey,
} from "@/lib/story/weekly-plan";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 45_000;

const JSON_SCHEMA = `{
  "weekly_plan": {
    "week1": { "events": "string", "vocabulary": "string" },
    "week2": { "events": "string", "vocabulary": "string" },
    "week3": { "events": "string", "vocabulary": "string" },
    "week4": { "events": "string", "vocabulary": "string" }
  }
}`;

const PAGE_BLOCKS: Record<WeeklyPlanKey, string> = {
  week1: "Pages 1–3",
  week2: "Pages 4–6",
  week3: "Pages 7–9",
  week4: "Pages 10–12",
};

export type SuggestWeeklyPlanResult =
  | { ok: true; weeklyPlan: WeeklyPlan }
  | { ok: false; reason: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJsonContent(content: string): unknown {
  const trimmed = content.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(withoutFence);
}

function sanitizeReason(message: string): string {
  return message
    .replace(/sk-[a-zA-Z0-9_-]+/g, "[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function weeksNeedingSuggestion(plan: WeeklyPlan): WeeklyPlanKey[] {
  return WEEK_PLAN_KEYS.filter((key) => plan[key].events.trim() === "");
}

function buildSuggestSystemPrompt(hasCharacters: boolean): string {
  const characterRules = hasCharacters
    ? `
Character planning rules (strict when a character list is provided):
- Weekly beats must reflect the teacher's character list.
- Each week's events field must name at least one listed character by display name.
- Do not invent unlisted official characters (Mom, Dad, Ms. Lee, Grandpa, Grandma, etc.) unless listed or named in Other.
- Spread listed characters across weeks where natural.`
    : "";

  return `You are a children's educational story planning assistant for the Nina & Nino series (ages 4–6).

Output rules (strict):
- Return ONLY valid JSON matching the schema below. No markdown fences.
- Propose brief main-idea beats (1–2 sentences per week) — NOT full story scripts.
- Each week maps to a 3-page block in a 12-page story.
- All four weeks must connect as ONE continuous arc under the Topic.
- Week 4 must include meaningful new learning or a final event — not recap-only.
${SUGGEST_VARIETY_GUIDANCE}
${characterRules}

JSON schema:
${JSON_SCHEMA}`;
}

export function buildSuggestUserPrompt(inputs: StoryInputs): string {
  const emptyWeeks = weeksNeedingSuggestion(inputs.weeklyPlan);
  const teacherBlocks = WEEK_PLAN_KEYS.map((key, index) => {
    const week = inputs.weeklyPlan[key];
    const events = week.events.trim();
    const vocabulary = week.vocabulary.trim();
    if (!events && !vocabulary) return null;
    return `Week ${index + 1} / ${PAGE_BLOCKS[key]} (teacher provided — do not change):
Events: ${events || "(none)"}
Vocabulary: ${vocabulary || "(none)"}`;
  })
    .filter(Boolean)
    .join("\n\n");

  const optionalLines: string[] = [];
  if (inputs.setting?.trim()) optionalLines.push(`Setting: ${inputs.setting.trim()}`);
  if (inputs.tone?.trim()) optionalLines.push(`Tone: ${inputs.tone.trim()}`);
  if (inputs.notes?.trim()) optionalLines.push(`Notes: ${inputs.notes.trim()}`);

  const characterBlock =
    inputs.characterHints?.official.length
      ? `\n${formatCharacterHintsForSuggestPlan(inputs.characterHints)}\n`
      : "";

  const characterClosingRule = inputs.characterHints?.official.length
    ? " For each empty week you propose, the events string must explicitly name which characters from the list above appear in that 3-page block."
    : "";

  const proposeList =
    emptyWeeks.length === 4
      ? "Propose main-idea beats for ALL four weeks."
      : `Propose main-idea beats ONLY for: ${emptyWeeks
          .map((key) => `Week ${WEEK_PLAN_KEYS.indexOf(key) + 1} (${PAGE_BLOCKS[key]})`)
          .join(", ")}.`;

  const shapeHint = formatStoryShapeHint(inputs.theme);
  const shapeClosingRule =
    emptyWeeks.length > 0
      ? " For empty weeks, follow the assigned story shape above — avoid generic 'face a small challenge' unless the shape is Challenge."
      : "";

  return `Plan a topic-centered monthly story outline.

Topic (master theme): ${inputs.theme}
Learning Goal: ${inputs.learning_goal.trim() || "(not specified — infer educational focus from Topic and weekly plan)"}
${characterBlock}
${shapeHint}
${optionalLines.length ? optionalLines.join("\n") + "\n" : ""}
${teacherBlocks ? `Teacher guidance already provided:\n${teacherBlocks}\n\n` : ""}${proposeList}
Return weekly_plan with all four weeks. For teacher-provided weeks, repeat their events/vocabulary exactly. For empty weeks, propose connected beats that fit the Topic, prior weeks, and the assigned story shape.${characterClosingRule}${shapeClosingRule}`;
}

function validateSuggestedPlan(raw: unknown): WeeklyPlan | null {
  if (!isRecord(raw)) return null;
  const planRaw = raw.weekly_plan ?? raw.inferred_weekly_plan;
  if (planRaw === undefined) return null;
  const plan = normalizeWeeklyPlan(planRaw);
  return isCompleteWeeklyPlan(plan) ? plan : null;
}

function mockWeekEventsWithCast(
  cast: string,
  theme: string,
  goalPhrase: string,
  inputs: StoryInputs
): Record<WeeklyPlanKey, { events: string; vocabulary: string }> {
  const supporting = getSupportingCharacterDisplayNames(inputs.characterHints);
  const other = inputs.characterHints?.other?.trim();
  const pick = (index: number) => supporting[index % supporting.length];
  const otherNote = other ? ` ${other} may join.` : "";

  if (!hasExtendedCharacterCast(inputs.characterHints)) {
    return {
      week1: {
        events: `${cast} begin exploring ${theme} and ${goalPhrase}.`,
        vocabulary: "learn, explore",
      },
      week2: {
        events: `${cast} practice and discover more about ${theme} through hands-on activities.`,
        vocabulary: "practice, discover",
      },
      week3: {
        events: `${cast} face a small challenge and work together to solve it within the ${theme} story.`,
        vocabulary: "help, try",
      },
      week4: {
        events: `${cast} finish with meaningful learning about ${theme} and a warm closing moment.`,
        vocabulary: "share, proud",
      },
    };
  }

  const week2Support = pick(0);
  const week3Support = pick(1);
  const week4Support = pick(2);

  return {
    week1: {
      events: `${cast} begin exploring ${theme} and ${goalPhrase}.`,
      vocabulary: "learn, explore",
    },
    week2: {
      events: `${cast} practice ${theme} activities.${week2Support ? ` ${week2Support} joins and helps.` : ""}${otherNote}`,
      vocabulary: "practice, discover",
    },
    week3: {
      events: `${cast} face a small challenge.${week3Support ? ` ${week3Support} helps them solve it.` : ` They work together to solve it.`}${otherNote}`,
      vocabulary: "help, try",
    },
    week4: {
      events: `${cast} finish with meaningful learning about ${theme}.${week4Support ? ` ${week4Support} shares a warm closing moment with them.` : " They share a warm closing moment."}${otherNote}`,
      vocabulary: "share, proud",
    },
  };
}

function mockSuggestedPlan(inputs: StoryInputs): WeeklyPlan {
  const { theme, learning_goal } = inputs;
  const cast = formatCharacterNamesForText(inputs.characterHints);
  const goalPhrase = learning_goal.trim()
    ? `set a goal tied to ${learning_goal}`
    : `learn about ${theme}`;
  const defaults = mockWeekEventsWithCast(cast, theme, goalPhrase, inputs);

  const suggested = emptyWeeklyPlan();
  for (const key of WEEK_PLAN_KEYS) {
    suggested[key] = { ...defaults[key] };
  }
  return suggested;
}

async function requestChatCompletion(
  apiKey: string,
  model: string,
  system: string,
  user: string
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
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, reason: `HTTP ${response.status}` };
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

export type SuggestWeeklyPlanOptions = {
  replaceAll?: boolean;
};

export async function suggestWeeklyPlan(
  inputs: StoryInputs,
  options?: SuggestWeeklyPlanOptions
): Promise<SuggestWeeklyPlanResult> {
  const replaceAll = options?.replaceAll === true;

  if (isCompleteWeeklyPlan(inputs.weeklyPlan) && !replaceAll) {
    return { ok: true, weeklyPlan: inputs.weeklyPlan };
  }

  const teacherPlan = replaceAll ? emptyWeeklyPlan() : inputs.weeklyPlan;
  const suggestInputs: StoryInputs = replaceAll
    ? { ...inputs, weeklyPlan: emptyWeeklyPlan() }
    : inputs;

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  let suggested: WeeklyPlan;
  const hasCharacters = Boolean(suggestInputs.characterHints?.official.length);

  if (!apiKey) {
    suggested = mockSuggestedPlan(suggestInputs);
  } else {
    const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
    const response = await requestChatCompletion(
      apiKey,
      model,
      buildSuggestSystemPrompt(hasCharacters),
      buildSuggestUserPrompt(suggestInputs)
    );

    if (!response.ok) {
      return { ok: false, reason: `Weekly plan suggestion failed: ${response.reason}` };
    }

    let parsed: unknown;
    try {
      parsed = parseJsonContent(response.content);
    } catch {
      return { ok: false, reason: "Weekly plan suggestion returned invalid JSON" };
    }

    const validated = validateSuggestedPlan(parsed);
    if (!validated) {
      return {
        ok: false,
        reason: "Weekly plan suggestion missing complete four-week plan",
      };
    }
    suggested = validated;
  }

  const merged = mergeWeeklyPlans(teacherPlan, suggested);
  if (!isCompleteWeeklyPlan(merged)) {
    return { ok: false, reason: "Merged weekly plan is incomplete" };
  }

  return { ok: true, weeklyPlan: merged };
}
