export type StorySetupFormState = {
  theme: string;
  learning_goal: string;
  vocabulary_focus: string;
  main_events: string;
  setting: string;
  tone: string;
  words_to_avoid: string;
  notes: string;
};

export const emptyStorySetupForm: StorySetupFormState = {
  theme: "",
  learning_goal: "",
  vocabulary_focus: "",
  main_events: "",
  setting: "",
  tone: "",
  words_to_avoid: "",
  notes: "",
};

export function isStorySetupFormValid(form: StorySetupFormState): boolean {
  return (
    form.theme.trim() !== "" &&
    form.learning_goal.trim() !== "" &&
    form.vocabulary_focus.trim() !== "" &&
    form.main_events.trim() !== ""
  );
}

export function storySetupFormToPayload(form: StorySetupFormState) {
  return {
    theme: form.theme.trim(),
    learning_goal: form.learning_goal.trim(),
    vocabulary_focus: form.vocabulary_focus.trim(),
    main_events: form.main_events.trim(),
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
  main_events: string;
  setting: string | null;
  tone: string | null;
  words_to_avoid: string | null;
  notes: string | null;
}): StorySetupFormState {
  return {
    theme: story.theme,
    learning_goal: story.learning_goal,
    vocabulary_focus: story.vocabulary_focus,
    main_events: story.main_events,
    setting: story.setting ?? "",
    tone: story.tone ?? "",
    words_to_avoid: story.words_to_avoid ?? "",
    notes: story.notes ?? "",
  };
}
