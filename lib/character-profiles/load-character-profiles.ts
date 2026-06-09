import type { SupabaseClient } from "@supabase/supabase-js";
import type { CharacterProfileMap, LoadCharacterProfilesResult } from "./types";
import { getFactoryCharacterProfiles } from "./factory-defaults";
import { resolveCharacterProfilesMap } from "./resolve-character-profiles";

const CHARACTER_PROFILE_COLUMNS =
  "character_key, display_name, role, appearance_description, personality_description, factory_appearance, factory_personality, is_official";

export async function loadCharacterProfiles(
  supabase: SupabaseClient
): Promise<LoadCharacterProfilesResult> {
  const factory = getFactoryCharacterProfiles();

  const { data, error } = await supabase
    .from("character_profiles")
    .select(CHARACTER_PROFILE_COLUMNS);

  if (error) {
    return {
      profiles: factory,
      source: "factory",
      warning: `Character profiles could not be loaded: ${error.message}`,
    };
  }

  if (!data || data.length === 0) {
    return {
      profiles: factory,
      source: "factory",
      warning: "No character profile rows found. Using factory defaults.",
    };
  }

  const resolved = resolveCharacterProfilesMap(data);

  const warning =
    resolved.fallbackKeys.length > 0
      ? `Using factory fallback for: ${resolved.fallbackKeys.join(", ")}`
      : null;

  return {
    profiles: resolved.profiles,
    source: "database",
    warning,
  };
}

export async function resolveCharacterProfiles(
  supabase: SupabaseClient
): Promise<CharacterProfileMap> {
  const result = await loadCharacterProfiles(supabase);
  return result.profiles;
}
