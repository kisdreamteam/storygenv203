/** Stable key for official Nina & Nino series characters. */
export type OfficialCharacterId =
  | "nina"
  | "nino"
  | "mom"
  | "dad"
  | "grandpa"
  | "ms_lee";

export type OfficialCharacterKey = OfficialCharacterId;

export const OFFICIAL_CHARACTER_KEYS: OfficialCharacterKey[] = [
  "nina",
  "nino",
  "mom",
  "dad",
  "grandpa",
  "ms_lee",
];

export type CharacterProfile = {
  characterKey: OfficialCharacterKey;
  displayName: string;
  role: string;
  appearanceDescription: string;
  personalityDescription: string;
  factoryAppearance: string;
  factoryPersonality: string;
  isOfficial: boolean;
};

export type CharacterProfileRow = {
  character_key: string;
  display_name: string;
  role: string;
  appearance_description: string;
  personality_description: string;
  factory_appearance: string;
  factory_personality: string;
  is_official: boolean;
};

export type CharacterProfileMap = Record<OfficialCharacterKey, CharacterProfile>;

export type CharacterProfileSource = "database" | "factory";

export type LoadCharacterProfilesResult = {
  profiles: CharacterProfileMap;
  source: CharacterProfileSource;
  warning: string | null;
};
