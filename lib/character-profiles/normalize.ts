import type { CharacterProfile, CharacterProfileRow } from "./types";
import { isOfficialCharacterKey } from "./factory-defaults";

function nonEmpty(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

export function normalizeCharacterProfileRow(row: CharacterProfileRow): CharacterProfile | null {
  if (!isOfficialCharacterKey(row.character_key)) {
    return null;
  }

  return {
    characterKey: row.character_key,
    displayName: nonEmpty(row.display_name),
    role: nonEmpty(row.role),
    appearanceDescription: nonEmpty(row.appearance_description),
    personalityDescription: nonEmpty(row.personality_description),
    factoryAppearance: nonEmpty(row.factory_appearance),
    factoryPersonality: nonEmpty(row.factory_personality),
    isOfficial: row.is_official,
  };
}

export function isValidEditableProfile(profile: CharacterProfile): boolean {
  return (
    profile.appearanceDescription.length > 0 && profile.personalityDescription.length > 0
  );
}
