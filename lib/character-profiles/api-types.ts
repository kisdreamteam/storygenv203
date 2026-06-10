import type { OfficialCharacterKey } from "./types";
import { OFFICIAL_CHARACTER_KEYS } from "./types";

export type CharacterProfileApiRow = {
  id: string;
  character_key: OfficialCharacterKey;
  display_name: string;
  role: string;
  appearance_description: string;
  personality_description: string;
};

export const CHARACTER_PROFILE_API_COLUMNS =
  "id, character_key, display_name, role, appearance_description, personality_description";

export function sortProfilesByOfficialOrder<
  T extends { character_key: string },
>(profiles: T[]): T[] {
  const order = new Map<string, number>(
    OFFICIAL_CHARACTER_KEYS.map((key, index) => [key, index])
  );
  return [...profiles].sort(
    (a, b) => (order.get(a.character_key) ?? 99) - (order.get(b.character_key) ?? 99)
  );
}
