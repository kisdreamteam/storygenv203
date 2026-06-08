/** Single source of truth for V1 illustration character continuity (character-bible.md + illustration-guide.md). */

export type OfficialCharacterId =
  | "nina"
  | "nino"
  | "mom"
  | "dad"
  | "grandpa"
  | "ms_lee";

export const CHARACTER_CONTINUITY: Record<OfficialCharacterId, string> = {
  nina: `Nina must ALWAYS appear as:
- older sister (~6 years old)
- medium skin tone
- dark brown hair in two neat pigtails
- bright red t-shirt
- dark red shorts
- white socks
- red sneakers
- brown eyes
- warm friendly smile

DO NOT:
- change clothing
- change hairstyle
- substitute colors
- change shoes`,

  nino: `Nino must ALWAYS appear as:
- younger brother (~4 years old)
- medium skin tone
- short messy warm-brown hair
- light green t-shirt
- dark green shorts
- white socks
- green sneakers
- brown eyes
- curious cheerful expression

DO NOT:
- change clothing
- change hairstyle
- substitute colors
- change shoes`,

  mom: `Mom must ALWAYS appear as:
- mother
- medium skin tone
- dark hair
- warm smile
- yellow áo dài

DO NOT:
- change clothing
- remove the yellow áo dài
- substitute outfit colors
- change hairstyle`,

  dad: `Dad must ALWAYS appear as:
- father
- medium skin tone
- short dark hair
- friendly face
- navy blue polo shirt
- khaki tan pants
- brown shoes
- warm smile

DO NOT:
- change clothing
- change hairstyle
- substitute colors
- change shoes`,

  grandpa: `Grandpa must ALWAYS appear as:
- grandfather
- white beard
- brown cap
- denim overalls
- warm smile
- friendly grandfather appearance

DO NOT:
- change clothing
- remove beard or cap
- substitute outfit colors`,

  ms_lee: `Ms. Lee must ALWAYS appear as:
- adult female teacher
- medium skin tone
- dark hair in a neat low bun
- friendly expression
- light blue button-up blouse
- navy blue knee-length skirt
- comfortable black flats

DO NOT:
- change clothing
- change hairstyle
- substitute colors
- change shoes`,
};

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

export const GLOBAL_ILLUSTRATION_SUFFIX = `16:9 aspect ratio, landscape composition, zoomed-out view, full-body characters visible, extra empty space suitable for adding educational text overlays later, no speech bubbles, no text, no labels, no watermarks, child-friendly educational illustration style, warm soft colors, simple shapes, friendly expressions, ages 4-6, consistent character appearance`;

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

/** Verbatim continuity blocks for characters on the page only. Never paraphrased or compressed. */
export function getCharacterContinuityText(pageText: string): string {
  const present = detectOfficialCharactersInText(pageText);
  if (present.length === 0) {
    return "";
  }
  return present.map((id) => CHARACTER_CONTINUITY[id].trim()).join("\n\n");
}

export type BuildIllustrationPromptInput = {
  pageText: string;
  pageNumber?: number;
  setting?: string;
  mood?: string;
  scene?: string;
};

export function sceneFromPageText(pageText: string): string {
  return pageText.split(".")[0]?.trim() || pageText.trim();
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
  const continuity = getCharacterContinuityText(input.pageText);
  const scene = input.scene?.trim() || sceneFromPageText(input.pageText);
  const mood =
    input.mood?.trim() ||
    (input.pageNumber !== undefined ? moodForPageNumber(input.pageNumber) : "");
  const setting = input.setting?.trim() ?? "";

  const sceneParts = [scene];
  if (setting) {
    sceneParts.push(setting);
  }
  if (mood) {
    sceneParts.push(mood);
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
>(pages: T[], setting: string): T[] {
  return pages.map((page) => ({
    ...page,
    illustration_prompt: buildIllustrationPrompt({
      pageText: page.text,
      pageNumber: page.page_number,
      setting,
    }),
  }));
}

/** Full locked rules for AI system prompts — verbatim blocks, never paraphrased. */
export function formatOfficialCharacterRulesForAi(): string {
  const allBlocks = OFFICIAL_CHARACTER_DETECTION_ORDER.map(
    (id) => CHARACTER_CONTINUITY[id].trim()
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
