import type { CharacterProfileMap, OfficialCharacterKey } from "./types";
import { OFFICIAL_CHARACTER_KEYS } from "./types";

const ILLUSTRATION_DO_NOT_RULES = `DO NOT:
- change clothing
- change hairstyle
- substitute colors
- change shoes`;

/**
 * Formats one official character's illustration continuity block from resolved appearance.
 */
export function formatIllustrationContinuityBlock(
  displayName: string,
  appearanceDescription: string
): string {
  return `${displayName} must ALWAYS appear as:
${appearanceDescription.trim()}

${ILLUSTRATION_DO_NOT_RULES}`;
}

/**
 * Builds illustration continuity blocks for all official characters from a resolved profile map.
 */
export function buildCharacterContinuityMap(
  profiles: CharacterProfileMap
): Record<OfficialCharacterKey, string> {
  const map = {} as Record<OfficialCharacterKey, string>;

  for (const key of OFFICIAL_CHARACTER_KEYS) {
    const profile = profiles[key];
    map[key] = formatIllustrationContinuityBlock(
      profile.displayName,
      profile.appearanceDescription
    );
  }

  return map;
}
