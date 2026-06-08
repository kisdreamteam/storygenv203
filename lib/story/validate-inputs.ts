import type { StoryInputs } from "@/lib/generation/types";

function optionalField(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function validateStoryInputs(
  body: Record<string, unknown>
): StoryInputs | { error: string } {
  const theme = typeof body.theme === "string" ? body.theme.trim() : "";
  const learning_goal =
    typeof body.learning_goal === "string" ? body.learning_goal.trim() : "";
  const vocabulary_focus =
    typeof body.vocabulary_focus === "string" ? body.vocabulary_focus.trim() : "";
  const main_events =
    typeof body.main_events === "string" ? body.main_events.trim() : "";

  if (!theme || !learning_goal || !vocabulary_focus || !main_events) {
    return {
      error:
        "Missing required fields: theme, learning_goal, vocabulary_focus, and main_events are required.",
    };
  }

  return {
    theme,
    learning_goal,
    vocabulary_focus,
    main_events,
    setting: optionalField(body.setting) ?? undefined,
    tone: optionalField(body.tone) ?? undefined,
    words_to_avoid: optionalField(body.words_to_avoid) ?? undefined,
    notes: optionalField(body.notes) ?? undefined,
  };
}
