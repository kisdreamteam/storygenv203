import { EMPTY_SERIES_MEMORY, type SeriesMemorySummary } from "@/lib/generation/types";
import { createServiceRoleClient } from "@/lib/supabase/server";

const SERIES_MEMORY_ID = "nina-nino";

export type SavedStoryMemory = {
  title: string;
  theme: string;
  key_events: string;
  vocab: string[];
  characters: string[];
};

export type StoryForMemoryUpdate = {
  title: string;
  theme: string;
  main_events: string;
  setting: string | null;
};

function dedupeAppend(existing: string[], items: string[]): string[] {
  const result = [...existing];
  for (const item of items) {
    if (item && !result.includes(item)) {
      result.push(item);
    }
  }
  return result;
}

function buildSavedStoryMemory(
  story: StoryForMemoryUpdate,
  vocabularyWords: string[]
): SavedStoryMemory {
  return {
    title: story.title,
    theme: story.theme,
    key_events: story.main_events.slice(0, 200),
    vocab: vocabularyWords,
    characters: ["Nina", "Nino"],
  };
}

function mergeRecentStories(
  existing: SeriesMemorySummary["recent_stories"],
  newEntry: SavedStoryMemory
): SeriesMemorySummary["recent_stories"] {
  const matchIndex = existing.findIndex(
    (entry) => entry.title === newEntry.title && entry.theme === newEntry.theme
  );

  let updated: SeriesMemorySummary["recent_stories"];
  if (matchIndex >= 0) {
    updated = [...existing];
    updated[matchIndex] = newEntry;
  } else {
    updated = [...existing, newEntry];
  }

  if (updated.length > 15) {
    return updated.slice(updated.length - 15);
  }

  return updated;
}

export function mergeSeriesMemorySummary(
  current: SeriesMemorySummary,
  story: StoryForMemoryUpdate,
  vocabularyWords: string[]
): SeriesMemorySummary {
  const newEntry = buildSavedStoryMemory(story, vocabularyWords);
  const setting = story.setting?.trim();

  return {
    characters: current.characters,
    settings: setting
      ? dedupeAppend(current.settings, [setting])
      : current.settings,
    recent_stories: mergeRecentStories(current.recent_stories, newEntry),
    vocabulary_history: dedupeAppend(current.vocabulary_history, vocabularyWords),
    themes_covered: dedupeAppend(current.themes_covered, [story.theme]),
    repetition_notes: current.repetition_notes,
  };
}

export type StoryMemorySource = {
  story: StoryForMemoryUpdate;
  vocabularyWords: string[];
};

export function buildSeriesMemorySummaryFromStories(
  sources: StoryMemorySource[]
): SeriesMemorySummary {
  let summary: SeriesMemorySummary = { ...EMPTY_SERIES_MEMORY };

  for (const { story, vocabularyWords } of sources) {
    summary = mergeSeriesMemorySummary(summary, story, vocabularyWords);
  }

  return summary;
}

export async function rebuildSeriesMemoryFromActiveStories(): Promise<{
  warning: string | null;
}> {
  const supabase = createServiceRoleClient();

  const { data: stories, error: storiesError } = await supabase
    .from("stories")
    .select("id, title, theme, main_events, setting")
    .eq("status", "saved")
    .eq("is_archived", false)
    .order("saved_at", { ascending: true });

  if (storiesError) {
    return {
      warning:
        "Story archived, but series memory could not be rebuilt. Continuity may still reflect removed stories.",
    };
  }

  const sources: StoryMemorySource[] = [];

  for (const story of stories ?? []) {
    const { data: vocabulary, error: vocabularyError } = await supabase
      .from("story_vocabulary")
      .select("word")
      .eq("story_id", story.id)
      .order("sort_order", { ascending: true });

    if (vocabularyError) {
      return {
        warning:
          "Story archived, but series memory could not be rebuilt. Continuity may still reflect removed stories.",
      };
    }

    sources.push({
      story: {
        title: story.title,
        theme: story.theme,
        main_events: story.main_events,
        setting: story.setting,
      },
      vocabularyWords: (vocabulary ?? []).map((item) => item.word),
    });
  }

  const summary = buildSeriesMemorySummaryFromStories(sources);

  const { error: updateError } = await supabase
    .from("series_memory")
    .update({
      summary,
      updated_at: new Date().toISOString(),
    })
    .eq("id", SERIES_MEMORY_ID);

  if (updateError) {
    return {
      warning:
        "Story archived, but series memory could not be rebuilt. Continuity may still reflect removed stories.",
    };
  }

  return { warning: null };
}

export async function updateSeriesMemoryOnSave(
  story: StoryForMemoryUpdate,
  vocabularyWords: string[]
): Promise<{ warning: string | null }> {
  const supabase = createServiceRoleClient();

  const { data: row, error: loadError } = await supabase
    .from("series_memory")
    .select("summary")
    .eq("id", SERIES_MEMORY_ID)
    .single();

  if (loadError || !row?.summary) {
    return {
      warning:
        "Story saved, but series memory could not be loaded. Continuity may not reflect this story.",
    };
  }

  const current = row.summary as SeriesMemorySummary;
  const merged = mergeSeriesMemorySummary(current, story, vocabularyWords);

  const { error: updateError } = await supabase
    .from("series_memory")
    .update({
      summary: merged,
      updated_at: new Date().toISOString(),
    })
    .eq("id", SERIES_MEMORY_ID);

  if (updateError) {
    return {
      warning:
        "Story saved, but series memory could not be updated. Continuity may not reflect this story.",
    };
  }

  return { warning: null };
}
