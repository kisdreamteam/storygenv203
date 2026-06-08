import {
  appendIllustrationContinuitySuffix,
  buildCharacterContinuityText,
} from "./character-continuity";

export const DEFAULT_ILLUSTRATION_SETTING = "Sunny Grove Kindergarten neighborhood";

export function moodForPageNumber(pageNumber: number): string {
  if (pageNumber <= 4) {
    return "Bright cheerful morning light";
  }
  if (pageNumber <= 9) {
    return "Warm playful afternoon light";
  }
  return "Cozy warm evening light";
}

export function sceneFromPageText(pageText: string): string {
  return pageText.split(".")[0]?.trim() || pageText.trim();
}

export function buildIllustrationPromptFromPageText(
  pageText: string,
  pageNumber: number,
  setting: string
): string {
  const scene = sceneFromPageText(pageText);
  const characters = buildCharacterContinuityText(pageText);
  const mood = moodForPageNumber(pageNumber);
  const resolvedSetting = setting.trim() || DEFAULT_ILLUSTRATION_SETTING;

  const parts = [scene];
  if (characters) {
    parts.push(characters);
  }
  parts.push(resolvedSetting, mood);

  return appendIllustrationContinuitySuffix(parts.join(". "));
}
