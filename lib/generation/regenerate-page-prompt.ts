import { loadCharacterProfiles } from "@/lib/character-profiles";
import { createClient } from "@/lib/supabase/server";
import { buildIllustrationPrompt } from "./character-continuity";
import { DEFAULT_ILLUSTRATION_SETTING } from "./illustration-prompt";

export type RegeneratePagePromptInput = {
  pageText: string;
  pageNumber: number;
  setting: string | null;
  theme: string;
};

export type RegeneratePagePromptResult = {
  illustration_prompt: string;
  warning: string | null;
};

export async function regeneratePageIllustrationPrompt(
  input: RegeneratePagePromptInput
): Promise<RegeneratePagePromptResult> {
  const setting = input.setting?.trim() || DEFAULT_ILLUSTRATION_SETTING;

  const supabase = await createClient();
  const { profiles, warning: profileWarning } = await loadCharacterProfiles(supabase);

  const illustration_prompt = buildIllustrationPrompt({
    pageText: input.pageText,
    pageNumber: input.pageNumber,
    setting,
    profiles,
  });

  return { illustration_prompt, warning: profileWarning };
}
