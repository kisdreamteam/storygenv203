import type { CharacterHints } from "@/lib/story/character-hints";
import { formatCharacterHintsForSuggestPlan } from "@/lib/story/character-hints";
import {
  WEEK_PLAN_KEYS,
  type WeeklyPlan,
  type WeeklyPlanKey,
} from "@/lib/story/weekly-plan";
import {
  STORY_ANTI_FORMULA_GUIDANCE,
  SUGGEST_VARIETY_GUIDANCE,
} from "./story-variety";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 45_000;
const OPTION_COUNT = 8;
const MAX_OPTION_WORDS = 10;

const JSON_SCHEMA = `{
  "options": ["string", "string", "string", "string", "string", "string", "string", "string"]
}`;

const PATH_OPTION_RULES = `
Path label rules (strict):
- Each option is ONE vague possible direction — not a scene, plot beat, or story summary.
- Target 3–7 words per option. Hard maximum 10 words.
- Do NOT include character names in option labels.
- Do NOT chain multiple events with commas or "and then".
- Do NOT write full sentences with setup, action, and outcome.
- Options must feel open-ended so final story generation can be creative.
- Vary directions: visit, try, help, find, explore, meet, choose, practice, notice, build, share, etc.
- Do NOT force problems, challenges, reflection, arrival, or warm closings by week number.
- Good: "Visit the animal room", "Try a new tool", "Find a surprise clue"
- Bad: "Nina and Nino visit the animal room, learn about rabbits, and help Ms. Lee feed them"
`.trim();

const PAGE_BLOCKS: Record<WeeklyPlanKey, string> = {
  week1: "Pages 1–3",
  week2: "Pages 4–6",
  week3: "Pages 7–9",
  week4: "Pages 10–12",
};

export type SuggestWeekOptionsInput = {
  theme: string;
  learning_goal?: string;
  characterHints?: CharacterHints;
  week: 1 | 2 | 3 | 4;
  priorWeeks?: Partial<WeeklyPlan>;
  setting?: string;
  tone?: string;
  notes?: string;
};

export type SuggestWeekOptionsResult =
  | { ok: true; options: string[] }
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

function weekKeyFromNumber(week: 1 | 2 | 3 | 4): WeeklyPlanKey {
  return WEEK_PLAN_KEYS[week - 1];
}

export function countPathOptionWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function normalizePathOption(option: string): string {
  const trimmed = option.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  const words = trimmed.split(/\s+/);
  if (words.length <= MAX_OPTION_WORDS) return trimmed;
  return words.slice(0, MAX_OPTION_WORDS).join(" ");
}

export function normalizePathOptions(options: string[]): string[] {
  return options.map(normalizePathOption).filter((item) => item.length > 0);
}

function buildSuggestSystemPrompt(): string {
  return `You are a children's educational story planning assistant for the Nina & Nino series (ages 4–6).

Output rules (strict):
- Return ONLY valid JSON matching the schema below. No markdown fences.
- Propose exactly ${OPTION_COUNT} distinct short path labels for ONE week only.
- Each option is an independent possibility — NOT steps in a fixed four-week arc.
${PATH_OPTION_RULES}
${SUGGEST_VARIETY_GUIDANCE}
${STORY_ANTI_FORMULA_GUIDANCE}

JSON schema:
${JSON_SCHEMA}`;
}

function formatPriorWeeksBlock(priorWeeks?: Partial<WeeklyPlan>): string {
  if (!priorWeeks) return "";

  const blocks = WEEK_PLAN_KEYS.map((key, index) => {
    const week = priorWeeks[key];
    const events = week?.events?.trim();
    if (!events) return null;
    return `Week ${index + 1} / ${PAGE_BLOCKS[key]} (already approved — stay consistent, do not copy verbatim):
${events}`;
  })
    .filter(Boolean)
    .join("\n\n");

  if (!blocks) return "";
  return `\nTeacher-approved prior paths (context only — do not extend into longer labels):\n${blocks}\n`;
}

export function buildSuggestWeekOptionsUserPrompt(input: SuggestWeekOptionsInput): string {
  const weekKey = weekKeyFromNumber(input.week);
  const weekNumber = input.week;
  const pageBlock = PAGE_BLOCKS[weekKey];

  const optionalLines: string[] = [];
  if (input.setting?.trim()) optionalLines.push(`Setting: ${input.setting.trim()}`);
  if (input.tone?.trim()) optionalLines.push(`Tone: ${input.tone.trim()}`);
  if (input.notes?.trim()) optionalLines.push(`Notes: ${input.notes.trim()}`);

  const characterBlock =
    input.characterHints?.official.length
      ? `\n${formatCharacterHintsForSuggestPlan(input.characterHints)}\n(Do not put character names in option labels.)\n`
      : "";

  const priorBlock = formatPriorWeeksBlock(input.priorWeeks);

  return `Suggest ${OPTION_COUNT} short path labels for Week ${weekNumber} only (${pageBlock}) of a monthly story.

Topic (master theme): ${input.theme}
Learning Goal: ${input.learning_goal?.trim() || "(not specified — infer educational focus from Topic)"}
${characterBlock}${priorBlock}
${optionalLines.length ? optionalLines.join("\n") + "\n" : ""}
Return exactly ${OPTION_COUNT} options in the "options" array. Each option must be a distinct, easy-to-scan path label (3–7 words, max 10) tailored to the Topic — open-ended directions, not completed scenes. Examples: "Visit the animal room", "Try a new tool", "Find a surprise clue". Do not propose a full four-week arc — only this week's possibilities.`;
}

function validateOptions(raw: unknown): string[] | null {
  if (!isRecord(raw)) return null;
  const optionsRaw = raw.options;
  if (!Array.isArray(optionsRaw)) return null;

  const options = normalizePathOptions(
    optionsRaw.filter((item): item is string => typeof item === "string")
  );

  if (options.length < OPTION_COUNT) return null;
  return options.slice(0, OPTION_COUNT);
}

const MOCK_OPTION_TEMPLATES: Record<WeeklyPlanKey, string[]> = {
  week1: [
    "Visit the {theme} area",
    "Notice something new",
    "Meet a new helper",
    "Explore a quiet place",
    "Try a simple activity",
    "Find an interesting object",
    "Ask a curious question",
    "Choose where to go",
  ],
  week2: [
    "Try a new tool",
    "Practice with a friend",
    "Sort and group items",
    "Follow a simple trail",
    "Listen and act it out",
    "Count something nearby",
    "Mix colors or shapes",
    "Teach a stuffed animal",
  ],
  week3: [
    "Find a surprise clue",
    "Help someone nearby",
    "Build something small",
    "Compare two things",
    "Share roles together",
    "Notice a pattern",
    "Adapt to a surprise",
    "Show someone how",
  ],
  week4: [
    "Use what you made",
    "Share a finished creation",
    "Invite others to try",
    "Spot it in daily life",
    "Celebrate with action",
    "Connect to a memory",
    "Plan one more adventure",
    "Leave a cheerful clue",
  ],
};

function mockWeekOptions(input: SuggestWeekOptionsInput): string[] {
  const weekKey = weekKeyFromNumber(input.week);
  const theme = input.theme.trim() || "topic";
  const templates = MOCK_OPTION_TEMPLATES[weekKey];

  return normalizePathOptions(
    templates.map((template) => template.replace(/\{theme\}/g, theme))
  ).slice(0, OPTION_COUNT);
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
        temperature: 0.8,
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

export async function suggestWeekOptions(
  input: SuggestWeekOptionsInput
): Promise<SuggestWeekOptionsResult> {
  if (!input.theme.trim()) {
    return { ok: false, reason: "Topic is required" };
  }

  if (input.week < 1 || input.week > 4) {
    return { ok: false, reason: "Week must be between 1 and 4" };
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return { ok: true, options: mockWeekOptions(input) };
  }

  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  const response = await requestChatCompletion(
    apiKey,
    model,
    buildSuggestSystemPrompt(),
    buildSuggestWeekOptionsUserPrompt(input)
  );

  if (!response.ok) {
    return { ok: false, reason: `Week options suggestion failed: ${response.reason}` };
  }

  let parsed: unknown;
  try {
    parsed = parseJsonContent(response.content);
  } catch {
    return { ok: false, reason: "Week options suggestion returned invalid JSON" };
  }

  const validated = validateOptions(parsed);
  if (!validated) {
    return { ok: false, reason: `Week options suggestion must return ${OPTION_COUNT} options` };
  }

  return { ok: true, options: validated };
}
