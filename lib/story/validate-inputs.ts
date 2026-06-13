import type { StoryInputs } from "@/lib/generation/types";
import {
  hasRequiredProtagonist,
  normalizeCharacterHints,
} from "./character-hints";
import {
  aggregateVocabularyFocus,
  deriveMainEventsText,
  isCompleteWeeklyPlan,
  normalizeWeeklyPlan,
} from "./weekly-plan";

function optionalField(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

const INCOMPLETE_WEEKLY_PLAN_ERROR =
  "Complete all four weekly guidance fields or use Suggest weekly plan first.";

const MISSING_PROTAGONIST_ERROR =
  "Select at least Nina or Nino before generating a story.";

function buildStoryInputs(
  body: Record<string, unknown>,
  weeklyPlan: ReturnType<typeof normalizeWeeklyPlan>,
  theme: string,
  legacyVocabularyFocus: string
): StoryInputs {
  const vocabulary_focus = aggregateVocabularyFocus(weeklyPlan, legacyVocabularyFocus);
  const characterHints = normalizeCharacterHints(body.characterHints);
  return {
    theme,
    learning_goal: typeof body.learning_goal === "string" ? body.learning_goal.trim() : "",
    vocabulary_focus,
    weeklyPlan,
    main_events: deriveMainEventsText(weeklyPlan, theme),
    characterHints,
    setting: optionalField(body.setting) ?? undefined,
    tone: optionalField(body.tone) ?? undefined,
    words_to_avoid: optionalField(body.words_to_avoid) ?? undefined,
    notes: optionalField(body.notes) ?? undefined,
  };
}

export function validateStoryInputs(
  body: Record<string, unknown>
): StoryInputs | { error: string } {
  const theme = typeof body.theme === "string" ? body.theme.trim() : "";
  const legacyVocabularyFocus =
    typeof body.vocabulary_focus === "string" ? body.vocabulary_focus.trim() : "";

  const weeklyPlan = normalizeWeeklyPlan(body.weeklyPlan);
  const characterHints = normalizeCharacterHints(body.characterHints);

  if (!theme) {
    return {
      error: "Missing required field: theme is required.",
    };
  }

  if (!hasRequiredProtagonist(characterHints)) {
    return { error: MISSING_PROTAGONIST_ERROR };
  }

  return buildStoryInputs(body, weeklyPlan, theme, legacyVocabularyFocus);
}

export function validateGenerateStoryInputs(
  body: Record<string, unknown>
): StoryInputs | { error: string } {
  const validated = validateStoryInputs(body);
  if ("error" in validated) {
    return validated;
  }

  if (!isCompleteWeeklyPlan(validated.weeklyPlan)) {
    return { error: INCOMPLETE_WEEKLY_PLAN_ERROR };
  }

  return validated;
}

export function validateGenerateStoryInputsFromRecord(inputs: StoryInputs): StoryInputs | { error: string } {
  if (!isCompleteWeeklyPlan(inputs.weeklyPlan)) {
    return { error: INCOMPLETE_WEEKLY_PLAN_ERROR };
  }
  if (inputs.characterHints && !hasRequiredProtagonist(inputs.characterHints)) {
    return { error: MISSING_PROTAGONIST_ERROR };
  }
  return inputs;
}
