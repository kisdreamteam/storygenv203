import type { SupabaseClient } from "@supabase/supabase-js";
import { loadCharacterProfiles, type CharacterProfileMap } from "@/lib/character-profiles";
import { injectIllustrationContinuityIntoPages } from "./character-continuity";
import { DEFAULT_ILLUSTRATION_SETTING } from "./illustration-prompt";
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

function enforceIllustrationContinuity(
  result: MockGenerationResult,
  inputs: StoryInputs,
  profiles: CharacterProfileMap
): MockGenerationResult {
  const setting = inputs.setting?.trim() || DEFAULT_ILLUSTRATION_SETTING;
  return {
    ...result,
    pages: injectIllustrationContinuityIntoPages(result.pages, setting, profiles),
  };
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
      result: enforceIllustrationContinuity(ai.result, inputs, profiles),
      warning: combineWarnings(memoryWarning, profileWarning),
    };
  }

  const mockResult = runMockPipeline(inputs, summary);
  const fallbackWarning = `AI generation unavailable (${ai.reason}). Using template story.`;

  return {
    result: enforceIllustrationContinuity(mockResult, inputs, profiles),
    warning: combineWarnings(memoryWarning, profileWarning, fallbackWarning),
  };
}
