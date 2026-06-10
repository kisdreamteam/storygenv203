import { loadCharacterProfiles } from "@/lib/character-profiles";
import { createClient } from "@/lib/supabase/server";
import { sceneFromPageText } from "./illustration-prompt";

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
  const supabase = await createClient();
  const { warning: profileWarning } = await loadCharacterProfiles(supabase);

  const illustration_prompt = sceneFromPageText(input.pageText);

  return { illustration_prompt, warning: profileWarning };
}
