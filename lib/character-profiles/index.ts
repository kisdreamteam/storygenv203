export type {
  CharacterProfile,
  CharacterProfileMap,
  CharacterProfileRow,
  CharacterProfileSource,
  LoadCharacterProfilesResult,
  OfficialCharacterId,
  OfficialCharacterKey,
} from "./types";
export { OFFICIAL_CHARACTER_KEYS } from "./types";

export {
  getFactoryCharacterProfiles,
  getFactoryProfile,
  isOfficialCharacterKey,
} from "./factory-defaults";

export { isValidEditableProfile, normalizeCharacterProfileRow } from "./normalize";

export {
  getCharacterProfileByKey,
  resolveCharacterProfilesMap,
  type ResolveCharacterProfilesResult,
} from "./resolve-character-profiles";

export { loadCharacterProfiles, resolveCharacterProfiles } from "./load-character-profiles";

export { formatOfficialCharacterProfilesForStory } from "./format-for-story-prompt";

export {
  buildCharacterContinuityMap,
  formatIllustrationContinuityBlock,
} from "./format-for-illustration-continuity";
