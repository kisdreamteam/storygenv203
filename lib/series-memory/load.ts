import type { SupabaseClient } from "@supabase/supabase-js";
import { EMPTY_SERIES_MEMORY, type SeriesMemorySummary } from "@/lib/generation/types";

const SERIES_MEMORY_ID = "nina-nino";

export type SeriesMemoryLoadResult = {
  summary: SeriesMemorySummary;
  warning: string | null;
};

export async function loadSeriesMemory(
  supabase: SupabaseClient
): Promise<SeriesMemoryLoadResult> {
  const { data, error } = await supabase
    .from("series_memory")
    .select("summary")
    .eq("id", SERIES_MEMORY_ID)
    .single();

  if (error || !data?.summary) {
    return {
      summary: EMPTY_SERIES_MEMORY,
      warning:
        "Series memory could not be loaded. Your story will generate without continuity context.",
    };
  }

  return {
    summary: data.summary as SeriesMemorySummary,
    warning: null,
  };
}
