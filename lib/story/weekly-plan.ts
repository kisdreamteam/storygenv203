import type { StoryInputs } from "@/lib/generation/types";
import { normalizeCharacterHints } from "./character-hints";

export type WeeklyPlanWeek = {
  events: string;
  vocabulary: string;
};

export type WeeklyPlan = {
  week1: WeeklyPlanWeek;
  week2: WeeklyPlanWeek;
  week3: WeeklyPlanWeek;
  week4: WeeklyPlanWeek;
};

/** Legacy flat shape stored before week-specific vocabulary. */
export type LegacyWeeklyPlan = {
  week1: string;
  week2: string;
  week3: string;
  week4: string;
};

export const WEEK_PLAN_KEYS = ["week1", "week2", "week3", "week4"] as const;
export type WeeklyPlanKey = (typeof WEEK_PLAN_KEYS)[number];

export const emptyWeeklyPlanWeek = (): WeeklyPlanWeek => ({
  events: "",
  vocabulary: "",
});

export const emptyWeeklyPlan = (): WeeklyPlan => ({
  week1: emptyWeeklyPlanWeek(),
  week2: emptyWeeklyPlanWeek(),
  week3: emptyWeeklyPlanWeek(),
  week4: emptyWeeklyPlanWeek(),
});

function isWeeklyPlanWeek(value: unknown): value is WeeklyPlanWeek {
  if (typeof value !== "object" || value === null) return false;
  const week = value as Record<string, unknown>;
  return typeof week.events === "string" && typeof week.vocabulary === "string";
}

export function isLegacyWeeklyPlan(value: unknown): value is LegacyWeeklyPlan {
  if (typeof value !== "object" || value === null) return false;
  const plan = value as Record<string, unknown>;
  return (
    typeof plan.week1 === "string" &&
    typeof plan.week2 === "string" &&
    typeof plan.week3 === "string" &&
    typeof plan.week4 === "string"
  );
}

export function isWeeklyPlan(value: unknown): value is WeeklyPlan {
  if (typeof value !== "object" || value === null) return false;
  const plan = value as Record<string, unknown>;
  return WEEK_PLAN_KEYS.every((key) => isWeeklyPlanWeek(plan[key]));
}

export function legacyWeeklyPlanToNested(legacy: LegacyWeeklyPlan): WeeklyPlan {
  return {
    week1: { events: legacy.week1.trim(), vocabulary: "" },
    week2: { events: legacy.week2.trim(), vocabulary: "" },
    week3: { events: legacy.week3.trim(), vocabulary: "" },
    week4: { events: legacy.week4.trim(), vocabulary: "" },
  };
}

export function normalizeWeeklyPlanWeek(value: unknown): WeeklyPlanWeek {
  if (isWeeklyPlanWeek(value)) {
    return {
      events: value.events.trim(),
      vocabulary: value.vocabulary.trim(),
    };
  }
  if (typeof value === "string") {
    return { events: value.trim(), vocabulary: "" };
  }
  return emptyWeeklyPlanWeek();
}

export function normalizeWeeklyPlan(value: unknown): WeeklyPlan {
  if (isWeeklyPlan(value)) {
    return {
      week1: normalizeWeeklyPlanWeek(value.week1),
      week2: normalizeWeeklyPlanWeek(value.week2),
      week3: normalizeWeeklyPlanWeek(value.week3),
      week4: normalizeWeeklyPlanWeek(value.week4),
    };
  }

  if (isLegacyWeeklyPlan(value)) {
    return legacyWeeklyPlanToNested(value);
  }

  return emptyWeeklyPlan();
}

export function weeklyPlanWeekEvents(week: WeeklyPlanWeek): string {
  return week.events.trim();
}

export function isCompleteWeeklyPlan(plan: WeeklyPlan): boolean {
  return WEEK_PLAN_KEYS.every((key) => weeklyPlanWeekEvents(plan[key]) !== "");
}

export function needsWeeklyPlanSuggestion(plan: WeeklyPlan): boolean {
  return !isCompleteWeeklyPlan(plan);
}

export function hasAnyWeeklyGuidance(plan: WeeklyPlan): boolean {
  return WEEK_PLAN_KEYS.some((key) => {
    const week = plan[key];
    return week.events.trim() !== "" || week.vocabulary.trim() !== "";
  });
}

export function mergeWeeklyPlans(teacher: WeeklyPlan, inferred: WeeklyPlan): WeeklyPlan {
  const merged = emptyWeeklyPlan();
  for (const key of WEEK_PLAN_KEYS) {
    const teacherWeek = teacher[key];
    const inferredWeek = inferred[key];
    merged[key] = {
      events: teacherWeek.events.trim() || inferredWeek.events.trim(),
      vocabulary: teacherWeek.vocabulary.trim() || inferredWeek.vocabulary.trim(),
    };
  }
  return merged;
}

export function deriveMainEventsText(plan: WeeklyPlan, topic?: string): string {
  if (isCompleteWeeklyPlan(plan)) {
    return weeklyPlanToMainEventsText(plan);
  }
  const summary = formatWeeklyPlanSummary(plan, topic);
  return summary || "";
}

export function parseWeekVocabulary(vocabulary: string): string[] {
  return vocabulary
    .split(/[,;]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);
}

/** Derive story-level vocabulary_focus from per-week vocabulary (legacy fallback). */
export function aggregateVocabularyFocus(plan: WeeklyPlan, fallback?: string): string {
  const words: string[] = [];
  const seen = new Set<string>();

  for (const key of WEEK_PLAN_KEYS) {
    for (const word of parseWeekVocabulary(plan[key].vocabulary)) {
      const lower = word.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      words.push(word);
    }
  }

  if (words.length > 0) {
    return words.join(", ");
  }

  return fallback?.trim() ?? "";
}

/** Parse legacy Main Events text with Week 1–4 headers into a weekly plan. */
export function weeklyPlanFromMainEventsText(mainEvents: string): WeeklyPlan | null {
  const text = mainEvents.trim();
  if (!text) return null;

  const headerPattern = /Week\s*([1-4])\s*:\s*/gi;
  const headers = [...text.matchAll(headerPattern)];
  if (headers.length < 4) return null;

  const plan = emptyWeeklyPlan();
  const weekKeys: WeeklyPlanKey[] = ["week1", "week2", "week3", "week4"];

  for (let i = 0; i < headers.length; i++) {
    const weekNumber = Number(headers[i][1]);
    if (weekNumber < 1 || weekNumber > 4) continue;
    const contentStart = (headers[i].index ?? 0) + headers[i][0].length;
    const contentEnd =
      i + 1 < headers.length ? (headers[i + 1].index ?? text.length) : text.length;
    const weekText = text.slice(contentStart, contentEnd).trim();
    plan[weekKeys[weekNumber - 1]] = { events: weekText, vocabulary: "" };
  }

  return isCompleteWeeklyPlan(plan) ? plan : null;
}

export function resolveWeeklyPlan(story: {
  weekly_plan?: unknown;
  main_events?: string | null;
  vocabulary_focus?: string | null;
}): WeeklyPlan {
  const fromColumn = normalizeWeeklyPlan(story.weekly_plan);
  if (isCompleteWeeklyPlan(fromColumn)) {
    return applyLegacyVocabularyFallback(fromColumn, story.vocabulary_focus);
  }

  const partial = normalizeWeeklyPlan(story.weekly_plan);
  if (WEEK_PLAN_KEYS.some((key) => weeklyPlanWeekEvents(partial[key]))) {
    return applyLegacyVocabularyFallback(partial, story.vocabulary_focus);
  }

  const fromMainEvents = weeklyPlanFromMainEventsText(story.main_events ?? "");
  if (fromMainEvents) {
    return applyLegacyVocabularyFallback(fromMainEvents, story.vocabulary_focus);
  }

  const legacy = story.main_events?.trim() ?? "";
  return applyLegacyVocabularyFallback(
    {
      week1: { events: legacy, vocabulary: "" },
      week2: emptyWeeklyPlanWeek(),
      week3: emptyWeeklyPlanWeek(),
      week4: emptyWeeklyPlanWeek(),
    },
    story.vocabulary_focus
  );
}

/** When older stories have global vocabulary_focus but empty per-week vocab, keep compatibility. */
function applyLegacyVocabularyFallback(plan: WeeklyPlan, vocabularyFocus?: string | null): WeeklyPlan {
  if (aggregateVocabularyFocus(plan)) {
    return plan;
  }

  const fallback = vocabularyFocus?.trim() ?? "";
  if (!fallback) {
    return plan;
  }

  return {
    ...plan,
    week1: {
      ...plan.week1,
      vocabulary: plan.week1.vocabulary.trim() || fallback,
    },
  };
}

/** Sync column for legacy reads and series memory summaries. */
export function weeklyPlanToMainEventsText(plan: WeeklyPlan): string {
  return WEEK_PLAN_KEYS.map(
    (key, index) => `Week ${index + 1}:\n${weeklyPlanWeekEvents(plan[key])}`
  ).join("\n\n");
}

export function formatWeeklyPlanSummary(plan: WeeklyPlan, topic?: string): string {
  const lines = [
    topic?.trim() ? `Topic: ${topic.trim()}` : null,
    ...WEEK_PLAN_KEYS.flatMap((key, index) => {
      const week = plan[key];
      const events = weeklyPlanWeekEvents(week);
      const vocab = week.vocabulary.trim();
      if (!events && !vocab) return [];
      const parts = [`Week ${index + 1}: ${events}`];
      if (vocab) parts.push(`Vocabulary: ${vocab}`);
      return [parts.join(" — ")];
    }),
  ].filter(Boolean);

  return lines.join("\n");
}

const PAGE_BLOCK_LABELS: Record<WeeklyPlanKey, string> = {
  week1: "Pages 1–3",
  week2: "Pages 4–6",
  week3: "Pages 7–9",
  week4: "Pages 10–12",
};

export function formatTopicFirstPlanForPrompt(
  topic: string,
  learningGoal: string,
  plan?: WeeklyPlan
): string {
  const normalizedPlan = plan ?? emptyWeeklyPlan();
  const hasGuidance = hasAnyWeeklyGuidance(normalizedPlan);

  const structureBlock = WEEK_PLAN_KEYS.map((key, index) => {
    const weekNumber = index + 1;
    const pageLabel = PAGE_BLOCK_LABELS[key];
    const beatRoles = [
      "introduce the Topic, setting, and a clear goal or question",
      "explore and practice within the Topic",
      "a small challenge or deeper learning tied to the Topic",
      "meaningful resolution or new learning with a warm ending",
    ];
    return `Week ${weekNumber} / ${pageLabel}: ${beatRoles[index]}`;
  }).join("\n");

  const guidanceBlocks = hasGuidance
    ? WEEK_PLAN_KEYS.map((key, index) => {
        const week = normalizedPlan[key];
        const events = week.events.trim();
        const vocabulary = week.vocabulary.trim();
        if (!events && !vocabulary) return null;
        const lines = [`Week ${index + 1} / ${PAGE_BLOCK_LABELS[key]}:`];
        if (events) {
          lines.push(`Teacher guidance (optional — expand into full scenes; do not copy verbatim):\n${events}`);
        }
        if (vocabulary) {
          lines.push(`Vocabulary hints:\n${vocabulary}`);
        }
        return lines.join("\n");
      })
        .filter(Boolean)
        .join("\n\n")
    : "";

  return `TOPIC-FIRST MONTHLY STORY PLAN (one connected 12-page story):

Topic (master theme — first priority):
${topic.trim()}

Learning Goal:
${learningGoal.trim()}

Four weekly beats (pages 1–3 / 4–6 / 7–9 / 10–12):
${structureBlock}

${hasGuidance ? `Teacher guidance for selected weeks:\n${guidanceBlocks}\n` : "No teacher weekly guidance provided — you must invent four connected weekly beats that progress the Topic through the page blocks above.\n"}
Planning rules:
- Weeks and page blocks are INTERNAL planning only — never mention weeks or page numbers in story text.
- The Topic is the master theme. Every page block must reinforce the Topic.
- Invent coherent weekly beats when teacher guidance is missing; lightly steer when guidance is present.
- Week 4 should include meaningful new learning or a final event — not recap-only, goodbye-only, or summary-only pages.
- Do not skip, merge, or significantly delay any week's beat.
- Do not place a later week's primary content in an earlier page block.`;
}

export function formatWeeklyPlanForPrompt(plan: WeeklyPlan, topic: string, learningGoal?: string): string {
  const weekBlocks = WEEK_PLAN_KEYS.map((key, index) => {
    const week = plan[key];
    const events = weeklyPlanWeekEvents(week);
    const vocabulary = week.vocabulary.trim() || "(use simple topic vocabulary if not specified)";
    return `Week ${index + 1} / ${PAGE_BLOCK_LABELS[key]}:
Main Events:
${events}
Vocabulary:
${vocabulary}`;
  }).join("\n\n");

  return `TOPIC-CENTERED MONTHLY STORY PLAN (required milestones — one connected story):

Topic:
${topic.trim()}

Learning Goal:
${learningGoal?.trim() || "(from teacher input)"}

${weekBlocks}

Planning rules:
- Weeks and page blocks are INTERNAL teacher planning only — never mention weeks or page numbers in story text.
- Each 3-page block must primarily cover its matching Main Events and Vocabulary.
- Vocabulary for each week should appear mostly inside that week's assigned pages.
- The Topic is the master theme. Every week must reinforce the Topic.
- Week 4 should include meaningful new learning or a final event — not recap-only, goodbye-only, or summary-only pages.
- Do not skip, merge, or significantly delay any week's milestone.
- Do not place a later week's primary events or vocabulary in an earlier page block.`;
}

/** Build generation inputs from a DB story row (legacy-safe). */
export function storyInputsFromRecord(story: {
  theme: string;
  learning_goal: string;
  vocabulary_focus: string;
  weekly_plan?: unknown;
  main_events?: string | null;
  character_hints?: unknown;
  setting?: string | null;
  tone?: string | null;
  words_to_avoid?: string | null;
  notes?: string | null;
}): StoryInputs {
  const weeklyPlan = resolveWeeklyPlan(story);
  const vocabulary_focus = aggregateVocabularyFocus(weeklyPlan, story.vocabulary_focus);
  const syncedMainEvents = isCompleteWeeklyPlan(weeklyPlan)
    ? weeklyPlanToMainEventsText(weeklyPlan)
    : story.main_events?.trim() || formatWeeklyPlanSummary(weeklyPlan, story.theme);

  return {
    theme: story.theme,
    learning_goal: story.learning_goal,
    vocabulary_focus,
    weeklyPlan,
    main_events: syncedMainEvents,
    characterHints: normalizeCharacterHints(story.character_hints),
    setting: story.setting?.trim() || undefined,
    tone: story.tone?.trim() || undefined,
    words_to_avoid: story.words_to_avoid?.trim() || undefined,
    notes: story.notes?.trim() || undefined,
  };
}

export function resolvePersistedWeeklyPlan(
  teacherPlan: WeeklyPlan,
  inferred: WeeklyPlan | undefined,
  topic: string,
  legacyVocabularyFocus?: string
): { weeklyPlan: WeeklyPlan; main_events: string; vocabulary_focus: string } {
  const weeklyPlan = mergeWeeklyPlans(teacherPlan, inferred ?? emptyWeeklyPlan());
  return {
    weeklyPlan,
    main_events: deriveMainEventsText(weeklyPlan, topic),
    vocabulary_focus: aggregateVocabularyFocus(weeklyPlan, legacyVocabularyFocus),
  };
}

/** Preferred vocabulary words for generation output (week-specific first). */
export function preferredVocabularyWords(plan: WeeklyPlan, fallback?: string): string[] {
  const aggregated = aggregateVocabularyFocus(plan, fallback);
  return parseWeekVocabulary(aggregated);
}
