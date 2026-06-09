import type { CharacterProfileMap } from "./types";
import { OFFICIAL_CHARACTER_KEYS } from "./types";

/**
 * Formats resolved official character profiles for story-generation system prompts.
 * Appearance and personality come from the resolver (DB when valid, factory fallback otherwise).
 */
export function formatOfficialCharacterProfilesForStory(
  profiles: CharacterProfileMap
): string {
  const lines = ["OFFICIAL CHARACTER PROFILES:"];

  for (const key of OFFICIAL_CHARACTER_KEYS) {
    const profile = profiles[key];
    lines.push(
      `${profile.displayName} (${profile.role}):`,
      `Appearance: ${profile.appearanceDescription}`,
      `Personality: ${profile.personalityDescription}`,
      ""
    );
  }

  return lines.join("\n").trim();
}
