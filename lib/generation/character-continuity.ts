/** Single source of truth for V1 illustration character continuity (docs/before-coding/character-bible.md + docs/before-coding/illustration-guide.md). */

import type { CharacterProfileMap, OfficialCharacterId } from "@/lib/character-profiles/types";
import { buildCharacterContinuityMap } from "@/lib/character-profiles/format-for-illustration-continuity";
import { getFactoryCharacterProfiles } from "@/lib/character-profiles/factory-defaults";

export type { OfficialCharacterId };

/** Factory-default continuity blocks — aligned with migration seed / Character Bible. */
export const CHARACTER_CONTINUITY: Record<OfficialCharacterId, string> =
  buildCharacterContinuityMap(getFactoryCharacterProfiles());

function resolveContinuityMap(
  profiles?: CharacterProfileMap
): Record<OfficialCharacterId, string> {
  return profiles ? buildCharacterContinuityMap(profiles) : CHARACTER_CONTINUITY;
}

/** Compact quick-reference descriptors from docs/before-coding/character-bible.md §14. */
export const NINA_DESCRIPTOR = CHARACTER_CONTINUITY.nina;
export const NINO_DESCRIPTOR = CHARACTER_CONTINUITY.nino;
export const MOM_DESCRIPTOR = CHARACTER_CONTINUITY.mom;
export const DAD_DESCRIPTOR = CHARACTER_CONTINUITY.dad;
export const GRANDPA_DESCRIPTOR = CHARACTER_CONTINUITY.grandpa;
export const MS_LEE_DESCRIPTOR = CHARACTER_CONTINUITY.ms_lee;

export const OFFICIAL_CHARACTER_DESCRIPTORS: Record<OfficialCharacterId, string> =
  CHARACTER_CONTINUITY;

export const OFFICIAL_CHARACTER_DETECTION_ORDER: OfficialCharacterId[] = [
  "nina",
  "nino",
  "mom",
  "dad",
  "grandpa",
  "ms_lee",
];

const CHARACTER_NAME_PATTERNS: Record<OfficialCharacterId, RegExp> = {
  nina: /\bNina\b/i,
  nino: /\bNino\b/i,
  mom: /\bMom\b/i,
  dad: /\bDad\b/i,
  grandpa: /\bGrandpa\b/i,
  ms_lee: /\bMs\.?\s*Lee\b/i,
};

export const GLOBAL_ILLUSTRATION_SUFFIX = `16:9 aspect ratio, landscape composition, zoomed-out view, full-body characters visible, extra empty space suitable for adding educational text later, no speech bubbles, no text, no labels, no watermarks, child-friendly educational illustration style, warm soft colors, simple shapes, friendly expressions, consistent character appearance, ages 4-6`;

/** @deprecated Use GLOBAL_ILLUSTRATION_SUFFIX */
export const LOCKED_ILLUSTRATION_SUFFIX = GLOBAL_ILLUSTRATION_SUFFIX;

export const CONTINUITY_SECTION_HEADER = "LOCKED CHARACTER CONTINUITY:";
export const SCENE_SECTION_HEADER = "SCENE:";
export const STYLE_SECTION_HEADER = "STYLE:";

export function detectOfficialCharactersInText(text: string): OfficialCharacterId[] {
  return OFFICIAL_CHARACTER_DETECTION_ORDER.filter((id) =>
    CHARACTER_NAME_PATTERNS[id].test(text)
  );
}

/** Appends the locked global illustration suffix; idempotent if already present. */
export function appendGlobalIllustrationSuffix(prompt: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return `${STYLE_SECTION_HEADER}\n\n${GLOBAL_ILLUSTRATION_SUFFIX}`;
  }
  if (trimmed.includes(GLOBAL_ILLUSTRATION_SUFFIX)) {
    return trimmed;
  }
  if (trimmed.includes(STYLE_SECTION_HEADER)) {
    return trimmed;
  }
  return `${trimmed}\n\n${STYLE_SECTION_HEADER}\n\n${GLOBAL_ILLUSTRATION_SUFFIX}`;
}

/** Verbatim continuity blocks for characters on the page only. Never paraphrased or compressed. */
export function getCharacterContinuityText(
  pageText: string,
  profiles?: CharacterProfileMap
): string {
  const continuityMap = resolveContinuityMap(profiles);
  const present = detectOfficialCharactersInText(pageText);
  if (present.length === 0) {
    return "";
  }
  return present.map((id) => continuityMap[id].trim()).join("\n\n");
}

export type BuildIllustrationPromptInput = {
  pageText: string;
  pageNumber?: number;
  setting?: string;
  mood?: string;
  scene?: string;
  profiles?: CharacterProfileMap;
};

export function sceneFromPageText(pageText: string): string {
  const trimmed = pageText.trim();
  const protectedText = trimmed.replace(
    /\b(Ms|Mr|Mrs|Dr)\./gi,
    (match) => match.replace(".", "\uE000")
  );
  const sentenceEnd = protectedText.indexOf(". ");
  const sentence =
    sentenceEnd >= 0 ? trimmed.slice(0, sentenceEnd + 1) : trimmed;
  return sentence.endsWith(".") ? sentence : `${sentence}.`;
}

export function moodForPageNumber(pageNumber: number): string {
  if (pageNumber <= 4) {
    return "Bright cheerful morning light";
  }
  if (pageNumber <= 9) {
    return "Warm playful afternoon light";
  }
  return "Cozy warm evening light";
}

/**
 * Builds a copy-ready illustration prompt with locked continuity injection.
 * Structure: LOCKED CHARACTER CONTINUITY → SCENE → STYLE
 */
export function buildIllustrationPrompt(input: BuildIllustrationPromptInput): string {
  const continuityText = [input.pageText, input.scene?.trim()]
    .filter(Boolean)
    .join("\n");
  const continuity = getCharacterContinuityText(continuityText, input.profiles);
  const scene = input.scene?.trim() || sceneFromPageText(input.pageText);
  const mood =
    input.mood?.trim() ||
    (input.pageNumber !== undefined ? moodForPageNumber(input.pageNumber) : "");
  const setting = input.setting?.trim() ?? "";

  const normalizePart = (part: string) => part.trim().replace(/\.+$/, "");
  const sceneParts = [normalizePart(scene)];
  if (setting) {
    sceneParts.push(normalizePart(setting));
  }
  if (mood) {
    sceneParts.push(normalizePart(mood));
  }

  const sections: string[] = [];

  if (continuity) {
    sections.push(`${CONTINUITY_SECTION_HEADER}\n\n${continuity}`);
  }

  sections.push(`${SCENE_SECTION_HEADER}\n\n${sceneParts.join(". ")}.`);
  sections.push(`${STYLE_SECTION_HEADER}\n\n${GLOBAL_ILLUSTRATION_SUFFIX}`);

  return sections.join("\n\n");
}

export function hasLockedIllustrationPromptStructure(prompt: string): boolean {
  const trimmed = prompt.trim();
  return (
    trimmed.includes(CONTINUITY_SECTION_HEADER) &&
    trimmed.includes(SCENE_SECTION_HEADER) &&
    trimmed.includes(STYLE_SECTION_HEADER) &&
    trimmed.includes(GLOBAL_ILLUSTRATION_SUFFIX)
  );
}

/** Rebuild illustration prompts for every page using locked continuity injection. */
export function injectIllustrationContinuityIntoPages<
  T extends { page_number: number; text: string; illustration_prompt: string },
>(pages: T[], setting: string, profiles?: CharacterProfileMap): T[] {
  return pages.map((page) => ({
    ...page,
    illustration_prompt: buildIllustrationPrompt({
      pageText: page.text,
      pageNumber: page.page_number,
      setting,
      scene: page.illustration_prompt,
      profiles,
    }),
  }));
}

/** Full locked rules for AI system prompts — verbatim blocks, never paraphrased. */
export function formatOfficialCharacterRulesForAi(
  profiles?: CharacterProfileMap
): string {
  const continuityMap = resolveContinuityMap(profiles);
  const allBlocks = OFFICIAL_CHARACTER_DETECTION_ORDER.map((id) =>
    continuityMap[id].trim()
  ).join("\n\n");

  return `Every illustration_prompt MUST use this exact three-section structure:

${CONTINUITY_SECTION_HEADER}
[verbatim continuity blocks for characters on that page only]

${SCENE_SECTION_HEADER}
[primary visual moment from page text + setting + mood]

${STYLE_SECTION_HEADER}
${GLOBAL_ILLUSTRATION_SUFFIX}

Rules:
- Copy continuity blocks verbatim from the list below — never paraphrase, summarize, or compress.
- Include ONLY characters mentioned on that page.
- Mom always wears yellow áo dài.

Full locked continuity blocks (copy verbatim when character appears on page):
${allBlocks}`;
}
