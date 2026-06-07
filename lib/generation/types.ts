export interface StoryInputs {
  theme: string;
  learning_goal: string;
  vocabulary_focus: string;
  main_events: string;
  setting?: string;
  tone?: string;
  words_to_avoid?: string;
  notes?: string;
}

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
}
