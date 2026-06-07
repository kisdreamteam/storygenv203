import type { SupabaseClient } from "@supabase/supabase-js";
import { runMockPipeline } from "./mock-pipeline";
import { loadSeriesMemory } from "@/lib/series-memory/load";
import type { MockGenerationResult, StoryInputs } from "./types";

export type GenerateStoryResult = {
  result: MockGenerationResult;
  warning: string | null;
};

export async function generateStory(
  supabase: SupabaseClient,
  inputs: StoryInputs
): Promise<GenerateStoryResult> {
  const { summary, warning } = await loadSeriesMemory(supabase);
  const result = runMockPipeline(inputs, summary);
  return { result, warning };
}
