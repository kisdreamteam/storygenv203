import { LOCKED_ILLUSTRATION_SUFFIX } from "@/lib/generation/character-continuity";

/** Locked continuity suffix from illustration-guide.md §3 */
export const ILLUSTRATION_STYLE_SUFFIX = LOCKED_ILLUSTRATION_SUFFIX;

export const ILLUSTRATION_PROMPT_FORMAT = `
Each illustration_prompt must follow:
[Scene action from page text]. [Locked character bible descriptors for characters on page only]. [Setting]. [Mood/lighting]. ${ILLUSTRATION_STYLE_SUFFIX}
`.trim();
