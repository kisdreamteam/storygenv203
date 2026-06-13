import type { SupabaseClient } from "@supabase/supabase-js";
import { loadCharacterProfiles } from "@/lib/character-profiles";
import { tryAiGeneration } from "./ai-generation";
import { runMockPipeline } from "./mock-pipeline";
import { loadSeriesMemory } from "@/lib/series-memory/load";
import { validateNoWeekLanguageInText } from "./week-structure";
import type { GenerationOptions, MockGenerationResult, StoryInputs } from "./types";

export type GenerateStoryResult =
  | { ok: true; result: MockGenerationResult; warning: string | null }
  | { ok: false; error: string; failureKind: "validation" };

function combineWarnings(...parts: Array<string | null | undefined>): string | null {
  const messages = parts.map((p) => p?.trim()).filter((p): p is string => !!p);
  return messages.length > 0 ? messages.join(" ") : null;
}

function weekLanguageWarningForMock(result: MockGenerationResult): string | null {
  const raw = {
    pages: result.pages.map((page) => ({
      page_number: page.page_number,
      text: page.text,
      illustration_scene: page.illustration_prompt,
    })),
  };

  const check = validateNoWeekLanguageInText(raw);
  if (check.ok) {
    return null;
  }

  return `Template story did not pass week-language checks (${check.reason}). Week-language validation is enforced on AI-generated stories.`;
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
      error: `Story could not be generated: ${ai.reason}`,
      failureKind: "validation",
    };
  }

  // Mock fallback only for API/key/timeout unavailability — never for validation failures.
  const mockResult = runMockPipeline(inputs, options);
  const fallbackWarning = `AI generation unavailable (${ai.reason}). Using template story.`;

  return {
    ok: true,
    result: mockResult,
    warning: combineWarnings(
      memoryWarning,
      profileWarning,
      fallbackWarning,
      weekLanguageWarningForMock(mockResult)
    ),
  };
}
