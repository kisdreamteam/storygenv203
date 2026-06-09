import type {
  CharacterProfile,
  CharacterProfileMap,
  CharacterProfileRow,
  OfficialCharacterKey,
} from "./types";
import { OFFICIAL_CHARACTER_KEYS } from "./types";
import { getFactoryProfile } from "./factory-defaults";
import { isValidEditableProfile, normalizeCharacterProfileRow } from "./normalize";

export type ResolveCharacterProfilesResult = {
  profiles: CharacterProfileMap;
  usedDatabaseKeys: OfficialCharacterKey[];
  fallbackKeys: OfficialCharacterKey[];
};

/**
 * Merge database rows with factory defaults.
 * DB values win when the row exists and editable fields are non-empty.
 */
export function resolveCharacterProfilesMap(
  rows: CharacterProfileRow[] | null | undefined
): ResolveCharacterProfilesResult {
  const profiles = {} as CharacterProfileMap;
  const usedDatabaseKeys: OfficialCharacterKey[] = [];
  const fallbackKeys: OfficialCharacterKey[] = [];

  const rowByKey = new Map<string, CharacterProfileRow>();
  for (const row of rows ?? []) {
    rowByKey.set(row.character_key, row);
  }

  for (const key of OFFICIAL_CHARACTER_KEYS) {
    const row = rowByKey.get(key);
    const normalized = row ? normalizeCharacterProfileRow(row) : null;

    if (normalized && isValidEditableProfile(normalized)) {
      profiles[key] = normalized;
      usedDatabaseKeys.push(key);
    } else {
      profiles[key] = getFactoryProfile(key);
      fallbackKeys.push(key);
    }
  }

  return { profiles, usedDatabaseKeys, fallbackKeys };
}

export function getCharacterProfileByKey(
  profiles: CharacterProfileMap,
  key: OfficialCharacterKey
): CharacterProfile {
  return profiles[key];
}
