/** Locked V1 character descriptors and illustration continuity (character-bible.md + illustration-guide.md). */

export type OfficialCharacterId =
  | "nina"
  | "nino"
  | "mom"
  | "dad"
  | "grandpa"
  | "ms_lee";

export const OFFICIAL_CHARACTER_DESCRIPTORS: Record<OfficialCharacterId, string> = {
  nina:
    "Nina is a 6-year-old girl with medium skin tone, dark brown hair in two neat pigtails, bright red t-shirt, dark red shorts, white socks, red sneakers, brown eyes, warm friendly smile",
  nino:
    "Nino is a 4-year-old boy with medium skin tone, short messy warm-brown hair, light green t-shirt, dark green shorts, white socks, green sneakers, brown eyes, curious cheerful expression",
  mom: "Mom is a woman with medium skin tone, dark hair, warm smile, yellow áo dài",
  dad: "Dad is a man with medium skin tone, short dark hair, friendly face, casual neutral clothing",
  grandpa:
    "Grandpa is a grandfather with white beard, brown cap, denim overalls, warm smile",
  ms_lee:
    "Ms. Lee is an adult female teacher with medium skin tone, dark hair, friendly expression, consistent teacher clothing",
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

/** Locked global illustration suffix from illustration-guide.md §3 */
export const LOCKED_ILLUSTRATION_SUFFIX =
  "16:9 aspect ratio, landscape composition, zoomed-out view, full-body characters visible, extra empty space suitable for adding educational text later, no speech bubbles, no text, no labels, no watermarks, child-friendly educational illustration style, warm soft colors, simple shapes, friendly expressions, consistent character appearance, ages 4-6";

export function detectOfficialCharactersInText(text: string): OfficialCharacterId[] {
  return OFFICIAL_CHARACTER_DETECTION_ORDER.filter((id) =>
    CHARACTER_NAME_PATTERNS[id].test(text)
  );
}

/** Character descriptor sentences for characters mentioned on the page only. */
export function buildCharacterContinuityText(pageText: string): string {
  const present = detectOfficialCharactersInText(pageText);
  if (present.length === 0) {
    return "";
  }
  return present.map((id) => OFFICIAL_CHARACTER_DESCRIPTORS[id]).join(". ");
}

/** Ensures the prompt ends with the locked global illustration suffix exactly once. */
export function appendIllustrationContinuitySuffix(prompt: string): string {
  const trimmed = prompt.trim().replace(/\.+$/, "");
  if (trimmed.includes("16:9 aspect ratio")) {
    return `${trimmed}.`;
  }
  return `${trimmed}. ${LOCKED_ILLUSTRATION_SUFFIX}.`;
}

/** Full locked rules for AI system prompts (all official characters + page-scoped rule). */
export function formatOfficialCharacterRulesForAi(): string {
  const lines = OFFICIAL_CHARACTER_DETECTION_ORDER.map(
    (id) => `- ${OFFICIAL_CHARACTER_DESCRIPTORS[id]}`
  );
  return `Locked official characters (include descriptors ONLY for characters present on that page):
${lines.join("\n")}
Mom always wears the yellow áo dài. Do not change locked clothing, hair, or skin tone for official characters.`;
}
