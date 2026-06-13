import type { WeeklyPlan } from "@/lib/story/weekly-plan";
import type { CharacterHints } from "@/lib/story/character-hints";

export interface StoryInputs {
  theme: string;
  learning_goal: string;
  vocabulary_focus: string;
  weeklyPlan: WeeklyPlan;
  /** Legacy sync text derived from weeklyPlan for DB column and series memory. */
  main_events: string;
  characterHints?: CharacterHints;
  setting?: string;
  tone?: string;
  words_to_avoid?: string;
  notes?: string;
}

export type GenerationMode = "generate" | "regenerate";

export type PreviousStoryPage = {
  page_number: number;
  text: string;
};

export type GenerationOptions = {
  mode?: GenerationMode;
  previousPages?: PreviousStoryPage[];
};

export interface SeriesMemorySummary {
  characters: unknown[];
  settings: string[];
  recent_stories: Array<{
    title?: string;
    theme?: string;
    key_events?: string;
    vocab?: string[];
    characters?: string[];
  }>;
  vocabulary_history: string[];
  themes_covered: string[];
  repetition_notes: string[];
}

export const EMPTY_SERIES_MEMORY: SeriesMemorySummary = {
  characters: [],
  settings: [],
  recent_stories: [],
  vocabulary_history: [],
  themes_covered: [],
  repetition_notes: [],
};

export interface MockGenerationResult {
  story: {
    title: string;
    status: "draft";
  };
  pages: Array<{
    page_number: number;
    text: string;
    illustration_prompt: string;
  }>;
  vocabulary: Array<{
    word: string;
    definition_or_example: string;
    sort_order: number;
  }>;
  inferred_weekly_plan?: WeeklyPlan;
}
