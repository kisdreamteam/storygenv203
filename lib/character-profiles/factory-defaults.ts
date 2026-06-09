import type { CharacterProfile, CharacterProfileMap, OfficialCharacterKey } from "./types";
import { OFFICIAL_CHARACTER_KEYS } from "./types";

/**
 * Factory defaults aligned with supabase/migrations/004_character_profiles.sql
 * and docs/before-coding/character-bible.md §3 / §14.
 */
const FACTORY_PROFILE_LIST: CharacterProfile[] = [
  {
    characterKey: "nina",
    displayName: "Nina",
    role: "Older sister",
    appearanceDescription:
      "6-year-old girl, medium skin tone, dark brown hair in two neat pigtails, bright red t-shirt, dark red shorts, white socks, red sneakers, brown eyes, warm friendly smile",
    personalityDescription:
      "Curious, patient, encouraging; short clear sentences; praises Nino's efforts",
    factoryAppearance:
      "6-year-old girl, medium skin tone, dark brown hair in two neat pigtails, bright red t-shirt, dark red shorts, white socks, red sneakers, brown eyes, warm friendly smile",
    factoryPersonality:
      "Curious, patient, encouraging; short clear sentences; praises Nino's efforts",
    isOfficial: true,
  },
  {
    characterKey: "nino",
    displayName: "Nino",
    role: "Younger brother",
    appearanceDescription:
      "4-year-old boy, medium skin tone, short messy warm-brown hair, light green t-shirt, dark green shorts, white socks, green sneakers, brown eyes, curious cheerful expression",
    personalityDescription:
      "Playful, eager, sometimes impulsive; simple phrases; repeats new words",
    factoryAppearance:
      "4-year-old boy, medium skin tone, short messy warm-brown hair, light green t-shirt, dark green shorts, white socks, green sneakers, brown eyes, curious cheerful expression",
    factoryPersonality:
      "Playful, eager, sometimes impulsive; simple phrases; repeats new words",
    isOfficial: true,
  },
  {
    characterKey: "mom",
    displayName: "Mom",
    role: "Mother",
    appearanceDescription:
      "woman, medium skin tone, dark hair, warm smile, yellow áo dài (always)",
    personalityDescription:
      "Calm, warm, practical, supportive; reassuring simple explanations",
    factoryAppearance:
      "woman, medium skin tone, dark hair, warm smile, yellow áo dài (always)",
    factoryPersonality:
      "Calm, warm, practical, supportive; reassuring simple explanations",
    isOfficial: true,
  },
  {
    characterKey: "dad",
    displayName: "Dad",
    role: "Father",
    appearanceDescription:
      "man, medium skin tone, short dark hair, friendly face, light navy polo shirt, khaki pants, brown casual shoes, warm smile",
    personalityDescription:
      "Friendly, playful, dependable; encouraging; models helpful actions",
    factoryAppearance:
      "man, medium skin tone, short dark hair, friendly face, light navy polo shirt, khaki pants, brown casual shoes, warm smile",
    factoryPersonality:
      "Friendly, playful, dependable; encouraging; models helpful actions",
    isOfficial: true,
  },
  {
    characterKey: "grandpa",
    displayName: "Grandpa",
    role: "Grandfather",
    appearanceDescription:
      "grandfather, white beard, brown cap, denim overalls, warm smile, friendly grandfather appearance",
    personalityDescription:
      "Warm, patient, gentle humor; shares simple wisdom with Nina and Nino",
    factoryAppearance:
      "grandfather, white beard, brown cap, denim overalls, warm smile, friendly grandfather appearance",
    factoryPersonality:
      "Warm, patient, gentle humor; shares simple wisdom with Nina and Nino",
    isOfficial: true,
  },
  {
    characterKey: "ms_lee",
    displayName: "Ms. Lee",
    role: "Teacher",
    appearanceDescription:
      "adult female teacher, medium skin tone, dark hair, friendly expression, light blue blouse, dark navy slacks, black flat shoes",
    personalityDescription: "Kind, organized, enthusiastic about learning",
    factoryAppearance:
      "adult female teacher, medium skin tone, dark hair, friendly expression, light blue blouse, dark navy slacks, black flat shoes",
    factoryPersonality: "Kind, organized, enthusiastic about learning",
    isOfficial: true,
  },
];

export function getFactoryCharacterProfiles(): CharacterProfileMap {
  const map = {} as CharacterProfileMap;
  for (const profile of FACTORY_PROFILE_LIST) {
    map[profile.characterKey] = profile;
  }
  return map;
}

export function getFactoryProfile(key: OfficialCharacterKey): CharacterProfile {
  return getFactoryCharacterProfiles()[key];
}

export function isOfficialCharacterKey(key: string): key is OfficialCharacterKey {
  return (OFFICIAL_CHARACTER_KEYS as string[]).includes(key);
}
