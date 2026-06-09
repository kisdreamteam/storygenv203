import { buildIllustrationPrompt } from "./character-continuity";

export {
  appendGlobalIllustrationSuffix,
  buildIllustrationPrompt,
  getCharacterContinuityText,
  GLOBAL_ILLUSTRATION_SUFFIX,
  moodForPageNumber,
  sceneFromPageText,
} from "./character-continuity";

export const DEFAULT_ILLUSTRATION_SETTING = "Sunny Grove Kindergarten neighborhood";

export function buildIllustrationPromptFromPageText(
  pageText: string,
  pageNumber: number,
  setting: string
): string {
  return buildIllustrationPrompt({
    pageText,
    pageNumber,
    setting: setting.trim() || DEFAULT_ILLUSTRATION_SETTING,
  });
}
