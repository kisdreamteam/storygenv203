import type { SupabaseClient } from "@supabase/supabase-js";
import { loadCharacterProfiles } from "@/lib/character-profiles";
import { tryAiGeneration } from "./ai-generation";
import { runMockPipeline } from "./mock-pipeline";
import { loadSeriesMemory } from "@/lib/series-memory/load";
import type { MockGenerationResult, StoryInputs } from "./types";

export type GenerateStoryResult = {
  result: MockGenerationResult;
  warning: string | null;
};

function combineWarnings(...parts: Array<string | null | undefined>): string | null {
  const messages = parts.map((p) => p?.trim()).filter((p): p is string => !!p);
  return messages.length > 0 ? messages.join(" ") : null;
}

export async function generateStory(
  supabase: SupabaseClient,
  inputs: StoryInputs
): Promise<GenerateStoryResult> {
  const [{ summary, warning: memoryWarning }, { profiles, warning: profileWarning }] =
    await Promise.all([loadSeriesMemory(supabase), loadCharacterProfiles(supabase)]);

  const ai = await tryAiGeneration(inputs, summary, profiles);
  if (ai.ok) {
    return {
      result: ai.result,
      warning: combineWarnings(memoryWarning, profileWarning),
    };
  }

  const mockResult = runMockPipeline(inputs, summary);
  const fallbackWarning = `AI generation unavailable (${ai.reason}). Using template story.`;

  return {
    result: mockResult,
    warning: combineWarnings(memoryWarning, profileWarning, fallbackWarning),
  };
}
