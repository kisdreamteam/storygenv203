/** Locked style suffix from illustration-guide.md §2 */

export const ILLUSTRATION_STYLE_SUFFIX =
  "Children's book illustration, warm soft colors, simple shapes, friendly expressions, clean background, ages 4-6, no text in image";

export const ILLUSTRATION_PROMPT_FORMAT = `
Each illustration_prompt must follow:
[Scene action from page text]. [Character bible descriptors for characters on page]. [Setting]. [Mood/lighting]. ${ILLUSTRATION_STYLE_SUFFIX}
`.trim();
