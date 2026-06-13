import {
  getFactoryCharacterProfiles,
  isOfficialCharacterKey,
  type OfficialCharacterKey,
} from "@/lib/character-profiles";

export type CharacterHints = {
  official: OfficialCharacterKey[];
  other?: string;
};

export const DEFAULT_CHARACTER_HINTS: CharacterHints = {
  official: ["nina", "nino"],
};

export const CHARACTER_TOGGLE_OPTIONS: Array<{
  key: OfficialCharacterKey;
  label: string;
}> = [
  { key: "nina", label: "Nina" },
  { key: "nino", label: "Nino" },
  { key: "mom", label: "Mom" },
  { key: "dad", label: "Dad" },
  { key: "ms_lee", label: "Ms. Lee" },
  { key: "grandpa", label: "Grandpa" },
  { key: "grandma", label: "Grandma" },
];

const PROTAGONIST_KEYS: OfficialCharacterKey[] = ["nina", "nino"];

function dedupeOfficialKeys(keys: OfficialCharacterKey[]): OfficialCharacterKey[] {
  const seen = new Set<OfficialCharacterKey>();
  const result: OfficialCharacterKey[] = [];
  for (const key of keys) {
    if (!seen.has(key)) {
      seen.add(key);
      result.push(key);
    }
  }
  return result;
}

export function normalizeCharacterHints(value: unknown): CharacterHints {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ...DEFAULT_CHARACTER_HINTS };
  }

  const record = value as Record<string, unknown>;
  const rawOfficial = Array.isArray(record.official) ? record.official : [];
  const official = dedupeOfficialKeys(
    rawOfficial.filter(
      (key): key is OfficialCharacterKey =>
        typeof key === "string" && isOfficialCharacterKey(key)
    )
  );

  const other =
    typeof record.other === "string" && record.other.trim() !== ""
      ? record.other.trim()
      : undefined;

  if (official.length === 0) {
    return { ...DEFAULT_CHARACTER_HINTS, other };
  }

  return { official, other };
}

export function characterHintsFromForm(
  selectedCharacters: OfficialCharacterKey[],
  otherCharacters: string
): CharacterHints {
  const official = dedupeOfficialKeys(selectedCharacters);
  const other = otherCharacters.trim() || undefined;
  return { official, other };
}

export function formFromCharacterHints(hints: CharacterHints | null | undefined): {
  selected_characters: OfficialCharacterKey[];
  other_characters: string;
} {
  const normalized = normalizeCharacterHints(hints ?? DEFAULT_CHARACTER_HINTS);
  return {
    selected_characters: normalized.official,
    other_characters: normalized.other ?? "",
  };
}

export function hasRequiredProtagonist(hints: CharacterHints): boolean {
  return PROTAGONIST_KEYS.some((key) => hints.official.includes(key));
}

export function needsSingleProtagonistWarning(hints: CharacterHints): boolean {
  const hasNina = hints.official.includes("nina");
  const hasNino = hints.official.includes("nino");
  return hasNina !== hasNino;
}

export function formatCharacterHintsForPrompt(hints: CharacterHints): string {
  const profiles = getFactoryCharacterProfiles();
  const names = hints.official.map((key) => profiles[key].displayName);
  const lines = [
    `Characters to feature: ${names.join(", ")}.`,
    "Include each selected character meaningfully across the story (multiple scenes; not required on every page).",
  ];
  if (hints.other?.trim()) {
    lines.push(`Additional characters if named: ${hints.other.trim()}.`);
  }
  return lines.join(" ");
}

export function toggleCharacterSelection(
  selected: OfficialCharacterKey[],
  key: OfficialCharacterKey
): OfficialCharacterKey[] {
  if (selected.includes(key)) {
    return selected.filter((k) => k !== key);
  }
  return [...selected, key];
}
