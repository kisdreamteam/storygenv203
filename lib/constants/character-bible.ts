import { formatOfficialCharacterRulesForAi } from "@/lib/generation/character-continuity";

export const TIER1_CHARACTER_RULES = formatOfficialCharacterRulesForAi();

/** Series tone and structure only — per-character lines come from resolved profiles in prompts. */
export const CHARACTER_BIBLE_EXCERPT = `
Series: Nina & Nino educational stories for ages 4–6.
Tone: warm, positive, classroom-safe. No violence, fear, or scary content.
Typical structure: intro → goal/problem → explore & vocabulary → resolution → reflection → warm close.
`.trim();
