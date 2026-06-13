import {
  aggregateVocabularyFocus,
  normalizeWeeklyPlan,
  resolveWeeklyPlan,
  type WeeklyPlan,
  type WeeklyPlanKey,
} from "./weekly-plan";

export type StorySetupFormState = {
  theme: string;
  learning_goal: string;
  week1_events: string;
  week1_vocabulary: string;
  week2_events: string;
  week2_vocabulary: string;
  week3_events: string;
  week3_vocabulary: string;
  week4_events: string;
  week4_vocabulary: string;
  setting: string;
  tone: string;
  words_to_avoid: string;
  notes: string;
};

export const emptyStorySetupForm: StorySetupFormState = {
  theme: "",
  learning_goal: "",
  week1_events: "",
  week1_vocabulary: "",
  week2_events: "",
  week2_vocabulary: "",
  week3_events: "",
  week3_vocabulary: "",
  week4_events: "",
  week4_vocabulary: "",
  setting: "",
  tone: "",
  words_to_avoid: "",
  notes: "",
};

const FORM_WEEK_FIELDS: Array<{
  key: WeeklyPlanKey;
  eventsField: keyof StorySetupFormState;
  vocabularyField: keyof StorySetupFormState;
}> = [
  { key: "week1", eventsField: "week1_events", vocabularyField: "week1_vocabulary" },
  { key: "week2", eventsField: "week2_events", vocabularyField: "week2_vocabulary" },
  { key: "week3", eventsField: "week3_events", vocabularyField: "week3_vocabulary" },
  { key: "week4", eventsField: "week4_events", vocabularyField: "week4_vocabulary" },
];

export function weeklyPlanFromForm(form: StorySetupFormState): WeeklyPlan {
  return {
    week1: {
      events: form.week1_events.trim(),
      vocabulary: form.week1_vocabulary.trim(),
    },
    week2: {
      events: form.week2_events.trim(),
      vocabulary: form.week2_vocabulary.trim(),
    },
    week3: {
      events: form.week3_events.trim(),
      vocabulary: form.week3_vocabulary.trim(),
    },
    week4: {
      events: form.week4_events.trim(),
      vocabulary: form.week4_vocabulary.trim(),
    },
  };
}

export function formFromWeeklyPlan(plan: WeeklyPlan): Pick<
  StorySetupFormState,
  | "week1_events"
  | "week1_vocabulary"
  | "week2_events"
  | "week2_vocabulary"
  | "week3_events"
  | "week3_vocabulary"
  | "week4_events"
  | "week4_vocabulary"
> {
  return {
    week1_events: plan.week1.events,
    week1_vocabulary: plan.week1.vocabulary,
    week2_events: plan.week2.events,
    week2_vocabulary: plan.week2.vocabulary,
    week3_events: plan.week3.events,
    week3_vocabulary: plan.week3.vocabulary,
    week4_events: plan.week4.events,
    week4_vocabulary: plan.week4.vocabulary,
  };
}

export function isStorySetupFormValid(form: StorySetupFormState): boolean {
  return form.theme.trim() !== "" && form.learning_goal.trim() !== "";
}

export function storySetupFormToPayload(form: StorySetupFormState) {
  const weeklyPlan = weeklyPlanFromForm(form);
  return {
    theme: form.theme.trim(),
    learning_goal: form.learning_goal.trim(),
    vocabulary_focus: aggregateVocabularyFocus(weeklyPlan),
    weeklyPlan,
    setting: form.setting.trim() || undefined,
    tone: form.tone.trim() || undefined,
    words_to_avoid: form.words_to_avoid.trim() || undefined,
    notes: form.notes.trim() || undefined,
  };
}

export function storySetupFromStory(story: {
  theme: string;
  learning_goal: string;
  vocabulary_focus: string;
  weekly_plan?: unknown;
  main_events?: string | null;
  setting: string | null;
  tone: string | null;
  words_to_avoid: string | null;
  notes: string | null;
}): StorySetupFormState {
  const plan = resolveWeeklyPlan(story);
  return {
    theme: story.theme,
    learning_goal: story.learning_goal,
    ...formFromWeeklyPlan(plan),
    setting: story.setting ?? "",
    tone: story.tone ?? "",
    words_to_avoid: story.words_to_avoid ?? "",
    notes: story.notes ?? "",
  };
}

export function normalizeWeeklyPlanInput(value: unknown): WeeklyPlan {
  return normalizeWeeklyPlan(value);
}

export { FORM_WEEK_FIELDS };
