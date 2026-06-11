import type { CharacterProfileMap } from "@/lib/character-profiles";
import { formatOfficialCharacterProfilesForStory } from "@/lib/character-profiles/format-for-story-prompt";
import { CHARACTER_BIBLE_EXCERPT } from "@/lib/constants/character-bible";
import type {
  GenerationOptions,
  PreviousStoryPage,
  SeriesMemorySummary,
  StoryInputs,
} from "./types";

const JSON_SCHEMA = `{
  "story": { "title": "string (max 60 chars, from theme)" },
  "pages": [
    { "page_number": 1, "text": "string (~30-40 words)", "illustration_scene": "string (10-50 words)" }
  ],
  "vocabulary": [
    { "word": "string", "definition_or_example": "string", "sort_order": 1 }
  ]
}`;

const STORY_QUALITY_GUIDANCE = `
Story quality (strict):

Story engine (required):
- Every story must have at least one clear through-line: a goal, simple question, small challenge, discovery, or something Nina and Nino are trying to complete
- Establish the goal or question by page 3 — do not wait until the end
- Examples: "Can they mail the letter?", "How do firefighters help?", "Can they choose books to borrow?", "How can they enjoy a rainy day indoors?"
- Avoid stories that are only a sequence of unrelated activities — each page should move the goal, question, or challenge forward

Page rhythm (12 pages):
- Pages 1–3: setup, setting, and clear goal or question
- Pages 4–8: exploration, practice, small challenge, or discovery tied to the goal
- Pages 9–10: success or resolution
- Page 11: reflection with callback to a specific earlier object, action, or moment
- Page 12: warm final image or action (concrete and visual — not a summary lecture)

Endings (pages 10–12):
- Do NOT only summarize the lesson — show story feeling through action, dialogue, or a picture the reader can see
- Callback to a specific earlier object, action, or moment from this story (not vague "today was fun")
- Simple reflection from Nina or Nino in child language (dialogue or brief thought)
- Warm final image or action; optional future-facing line is fine
- Do NOT use generic closings such as "Everyone was happy", "They learned a lot", "It was a wonderful day", "They had fun", "They felt proud of their community", "Great job", or similar vague wrap-ups

Vocabulary reinforcement:
- Pages 2–4: introduce key vocabulary from the teacher's focus naturally in context
- Pages 5–8: reuse words through action or dialogue — not as a list
- Pages 9–11: recall 1–3 key vocabulary words naturally in the story
- Page 12: close with story feeling and a warm image — not a vocabulary list or definition dump
- Do not list vocabulary unnaturally or dump definitions in story text

Word variety:
- Vary sentence structures and repeated phrases across pages — avoid copying the same pattern on many pages
- Positive emotional words (happy, excited, smile, laugh, cheer, proud) may repeat naturally when appropriate for ages 4–6
- Prefer variety when it sounds natural; do not force awkward synonyms just to avoid repetition
- Still reduce overuse of look/looked, everyone, great job, wonderful, and filler phrases
- Keep language simple — do not use advanced vocabulary or complex sentences

Supporting adults:
- Use only the adults needed for this story — Nina and Nino may lead many scenes alone or with peers
- Do not force Mom, Dad, Grandpa, Grandma, and Ms. Lee into every story
- If a helper is needed, choose the most natural adult for the setting
- Community workers are welcome when relevant: librarian, firefighter, dentist, postal worker, baker, guide, etc.
- Supporting adults should teach, guide, or move the story forward — not appear only for a one-line cameo

Standalone story (strict):
- Every story must be self-contained. Assume students have never read any previous Nina & Nino story.
- Do not mention previous stories, previous adventures, "last time," "remember when," or earlier visits in story text unless the teacher explicitly asks for a sequel, continuation, or callback in Theme, Main Events, or Notes.
- Series Memory helps avoid repeating plots, themes, and vocabulary — it is NOT a license to open with prior-story references.
`.trim();

const REGENERATE_VARIATION_GUIDANCE = `
REGENERATION REQUEST (strict):
This is a regeneration request. Keep the same theme, learning goal, vocabulary focus, characters, age level, and teacher constraints, but create a substantially different story version.

Variation rules:
- Do not reuse the same page-by-page plot structure as the previous version
- Use a different opening action
- Use a different middle activity or small problem
- Use different dialogue lines
- Use a different ending reflection
- Keep vocabulary naturally integrated
- Avoid copying prior page wording
- Do not contradict teacher inputs; keep classroom safety and standalone story rules
`.trim();

const MAX_PREVIOUS_PAGE_SNIPPET = 120;
const MAX_PREVIOUS_STORY_BLOCK = 1500;

export function formatPreviousStoryAntiRepetition(pages: PreviousStoryPage[]): string {
  const sorted = [...pages].sort((a, b) => a.page_number - b.page_number);
  const lines: string[] = [];
  let totalLength = 0;

  for (const page of sorted) {
    const snippet =
      page.text.length > MAX_PREVIOUS_PAGE_SNIPPET
        ? `${page.text.slice(0, MAX_PREVIOUS_PAGE_SNIPPET)}...`
        : page.text;
    const line = `Page ${page.page_number}: ${snippet}`;
    if (totalLength + line.length > MAX_PREVIOUS_STORY_BLOCK) break;
    lines.push(line);
    totalLength += line.length;
  }

  return lines.join("\n");
}

export function buildSystemPrompt(profiles: CharacterProfileMap): string {
  return `You are a children's educational story writer for the Nina & Nino series (ages 4–6).

${CHARACTER_BIBLE_EXCERPT}

${formatOfficialCharacterProfilesForStory(profiles)}

Output rules (strict):
- Return ONLY valid JSON matching the schema below. No markdown fences.
- Exactly 12 pages with page_number 1 through 12.
- Each page text: aim for 30–40 words, simple sentences, ages 4–6 readability. A page may be slightly shorter (about 25 words) if the meaning is complete. Do not pad with filler just to meet word count.
- 1–40 vocabulary items from the teacher's vocabulary focus.
- One illustration_scene per page: a short visual description (10–50 words) of what should appear in the illustration.
- illustration_scene: who is doing what, key objects, composition hint only — no character clothing or appearance details (the server adds those).
- Do not include style suffixes, section headers, or JSON inside illustration_scene.
- Educational usefulness over flashy creativity. Classroom-safe tone.
- Teacher inputs override Series Memory when they conflict.

${STORY_QUALITY_GUIDANCE}

JSON schema:
${JSON_SCHEMA}`;
}

export function buildUserPrompt(
  inputs: StoryInputs,
  memory: SeriesMemorySummary,
  options?: GenerationOptions
): string {
  const optionalLines: string[] = [];
  if (inputs.setting?.trim()) optionalLines.push(`Setting: ${inputs.setting.trim()}`);
  if (inputs.tone?.trim()) optionalLines.push(`Tone: ${inputs.tone.trim()}`);
  if (inputs.words_to_avoid?.trim()) {
    optionalLines.push(`Words to avoid: ${inputs.words_to_avoid.trim()}`);
  }
  if (inputs.notes?.trim()) optionalLines.push(`Notes: ${inputs.notes.trim()}`);

  const memoryJson = JSON.stringify(
    {
      recent_stories: memory.recent_stories.slice(-3),
      settings: memory.settings,
      themes_covered: memory.themes_covered.slice(-5),
      vocabulary_history: memory.vocabulary_history.slice(-10),
    },
    null,
    2
  );

  const mode = options?.mode ?? "generate";
  const regenerateBlock =
    mode === "regenerate"
      ? (() => {
          const previousPages = options?.previousPages ?? [];
          const antiRepetition =
            previousPages.length > 0
              ? `\n\nPrevious version to avoid repeating (structure and wording — do not copy):\n${formatPreviousStoryAntiRepetition(previousPages)}`
              : "";
          return `\n\n${REGENERATE_VARIATION_GUIDANCE}${antiRepetition}`;
        })()
      : "";

  return `Write a 12-page Nina & Nino story.

Required inputs:
- Theme / Topic: ${inputs.theme}
- Learning Goal: ${inputs.learning_goal}
- Vocabulary Focus: ${inputs.vocabulary_focus}
- Main Events: ${inputs.main_events}
${optionalLines.length ? optionalLines.join("\n") + "\n" : ""}
Series Memory (internal continuity only — do NOT reference previous stories in story text):
Use to avoid repeating plots, themes, and vocabulary. Each story must still read standalone for students who have not read prior stories.
${memoryJson}${regenerateBlock}`;
}
