import {
  CONTINUITY_SECTION_HEADER,
  GLOBAL_ILLUSTRATION_SUFFIX,
  SCENE_SECTION_HEADER,
  STYLE_SECTION_HEADER,
} from "@/lib/generation/character-continuity";

/** Locked continuity suffix from docs/before-coding/illustration-guide.md §3 */
export const ILLUSTRATION_STYLE_SUFFIX = GLOBAL_ILLUSTRATION_SUFFIX;

export const ILLUSTRATION_PROMPT_FORMAT = `
Each illustration_prompt MUST use this exact structure:

${CONTINUITY_SECTION_HEADER}
[verbatim locked continuity blocks for characters on page only]

${SCENE_SECTION_HEADER}
[primary visual moment + setting + mood]

${STYLE_SECTION_HEADER}
${GLOBAL_ILLUSTRATION_SUFFIX}
`.trim();
