export const MAX_PROFILE_FIELD_LENGTH = 2000;

export type ValidateEditableProfileFieldsResult =
  | { ok: true; appearance: string; personality: string }
  | { ok: false; error: string };

export function validateEditableProfileFields(
  appearance: unknown,
  personality: unknown
): ValidateEditableProfileFieldsResult {
  if (typeof appearance !== "string" || typeof personality !== "string") {
    return { ok: false, error: "appearance_description and personality_description must be strings." };
  }

  const trimmedAppearance = appearance.trim();
  const trimmedPersonality = personality.trim();

  if (!trimmedAppearance || !trimmedPersonality) {
    return {
      ok: false,
      error: "appearance_description and personality_description cannot be empty.",
    };
  }

  if (trimmedAppearance.length > MAX_PROFILE_FIELD_LENGTH) {
    return {
      ok: false,
      error: `appearance_description exceeds ${MAX_PROFILE_FIELD_LENGTH} characters.`,
    };
  }

  if (trimmedPersonality.length > MAX_PROFILE_FIELD_LENGTH) {
    return {
      ok: false,
      error: `personality_description exceeds ${MAX_PROFILE_FIELD_LENGTH} characters.`,
    };
  }

  return {
    ok: true,
    appearance: trimmedAppearance,
    personality: trimmedPersonality,
  };
}
