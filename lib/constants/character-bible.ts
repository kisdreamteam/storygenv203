/** Compact Tier 1 descriptors from character-bible.md §12 (for generation prompts). */

export const NINA_DESCRIPTOR =
  "Nina: 6-year-old girl, medium-brown skin, dark curly hair in two puffs, yellow shirt, blue overalls, red sneakers";

export const NINO_DESCRIPTOR =
  "Nino: 4-year-old boy, medium-brown skin, short curly dark hair, green shirt, tan shorts, blue sneakers";

export const TIER1_CHARACTER_RULES = `${NINA_DESCRIPTOR}. ${NINO_DESCRIPTOR}.`;

export const CHARACTER_BIBLE_EXCERPT = `
Series: Nina & Nino educational stories for ages 4–6.
Nina (6): curious, patient, encouraging; short clear sentences.
Nino (4): playful, eager; simple phrases; learns by doing.
Tone: warm, positive, classroom-safe. No violence, fear, or scary content.
Typical structure: intro → goal/problem → explore & vocabulary → resolution → reflection → warm close.
`.trim();
