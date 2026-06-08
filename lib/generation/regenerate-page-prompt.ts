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

  const illustration_prompt = buildIllustrationPrompt({
    pageText: input.pageText,
    pageNumber: input.pageNumber,
    setting,
  });

  return { illustration_prompt, warning: null };
}
