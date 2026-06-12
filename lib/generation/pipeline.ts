import type { SupabaseClient } from "@supabase/supabase-js";
import { loadCharacterProfiles } from "@/lib/character-profiles";
import { tryAiGeneration } from "./ai-generation";
import { runMockPipeline } from "./mock-pipeline";
import { loadSeriesMemory } from "@/lib/series-memory/load";
import type { GenerationOptions, MockGenerationResult, StoryInputs } from "./types";

export type GenerateStoryResult =
  | { ok: true; result: MockGenerationResult; warning: string | null }
  | { ok: false; error: string; failureKind: "validation" };

function combineWarnings(...parts: Array<string | null | undefined>): string | null {
  const messages = parts.map((p) => p?.trim()).filter((p): p is string => !!p);
  return messages.length > 0 ? messages.join(" ") : null;
}

export async function generateStory(
  supabase: SupabaseClient,
  inputs: StoryInputs,
  options?: GenerationOptions
): Promise<GenerateStoryResult> {
  const [{ summary, warning: memoryWarning }, { profiles, warning: profileWarning }] =
    await Promise.all([loadSeriesMemory(supabase), loadCharacterProfiles(supabase)]);

  const ai = await tryAiGeneration(inputs, summary, profiles, options);
  if (ai.ok) {
    return {
      ok: true,
      result: ai.result,
      warning: combineWarnings(memoryWarning, profileWarning),
    };
  }

  if (ai.failureKind === "validation") {
    return {
      ok: false,
      error:
        "Story could not be generated because the AI output did not meet quality requirements. Please try again.",
      failureKind: "validation",
    };
  }

  const mockResult = runMockPipeline(inputs, options);
  const fallbackWarning = `AI generation unavailable (${ai.reason}). Using template story.`;

  return {
    ok: true,
    result: mockResult,
    warning: combineWarnings(memoryWarning, profileWarning, fallbackWarning),
  };
}
