import {
  OFFICIAL_CHARACTER_DESCRIPTORS,
  formatOfficialCharacterRulesForAi,
} from "@/lib/generation/character-continuity";

export const NINA_DESCRIPTOR = OFFICIAL_CHARACTER_DESCRIPTORS.nina;

export const NINO_DESCRIPTOR = OFFICIAL_CHARACTER_DESCRIPTORS.nino;

export const TIER1_CHARACTER_RULES = formatOfficialCharacterRulesForAi();

export const CHARACTER_BIBLE_EXCERPT = `
Series: Nina & Nino educational stories for ages 4–6.
Nina (6): curious, patient, encouraging; short clear sentences.
Nino (4): playful, eager; simple phrases; learns by doing.
Mom: calm, warm; always wears yellow áo dài.
Dad: friendly, playful, dependable.
Grandpa: warm, patient grandfather.
Ms. Lee: kind kindergarten teacher at Sunny Grove Kindergarten.
Tone: warm, positive, classroom-safe. No violence, fear, or scary content.
Typical structure: intro → goal/problem → explore & vocabulary → resolution → reflection → warm close.
`.trim();
