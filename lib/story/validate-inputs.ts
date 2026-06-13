import type { StoryInputs } from "@/lib/generation/types";
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

function buildStoryInputs(
  body: Record<string, unknown>,
  weeklyPlan: ReturnType<typeof normalizeWeeklyPlan>,
  theme: string,
  legacyVocabularyFocus: string
): StoryInputs {
  const vocabulary_focus = aggregateVocabularyFocus(weeklyPlan, legacyVocabularyFocus);
  return {
    theme,
    learning_goal: typeof body.learning_goal === "string" ? body.learning_goal.trim() : "",
    vocabulary_focus,
    weeklyPlan,
    main_events: deriveMainEventsText(weeklyPlan, theme),
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
  const learning_goal =
    typeof body.learning_goal === "string" ? body.learning_goal.trim() : "";
  const legacyVocabularyFocus =
    typeof body.vocabulary_focus === "string" ? body.vocabulary_focus.trim() : "";

  const weeklyPlan = normalizeWeeklyPlan(body.weeklyPlan);

  if (!theme || !learning_goal) {
    return {
      error: "Missing required fields: theme and learning_goal are required.",
    };
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
  return inputs;
}
