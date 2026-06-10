import type { CharacterProfileMap } from "@/lib/character-profiles";
import { formatOfficialCharacterProfilesForStory } from "@/lib/character-profiles/format-for-story-prompt";
import { CHARACTER_BIBLE_EXCERPT } from "@/lib/constants/character-bible";
import type { SeriesMemorySummary, StoryInputs } from "./types";

const JSON_SCHEMA = `{
  "story": { "title": "string (max 60 chars, from theme)" },
  "pages": [
    { "page_number": 1, "text": "string (~30-40 words)", "illustration_scene": "string (10-50 words)" }
  ],
  "vocabulary": [
    { "word": "string", "definition_or_example": "string", "sort_order": 1 }
  ]
}`;

export function buildSystemPrompt(profiles: CharacterProfileMap): string {
  return `You are a children's educational story writer for the Nina & Nino series (ages 4–6).

${CHARACTER_BIBLE_EXCERPT}

${formatOfficialCharacterProfilesForStory(profiles)}

Output rules (strict):
- Return ONLY valid JSON matching the schema below. No markdown fences.
- Exactly 12 pages with page_number 1 through 12.
- Each page text: ~30–40 words, simple sentences, ages 4–6 readability.
- 1–40 vocabulary items from the teacher's vocabulary focus.
- One illustration_scene per page: a short visual description (10–50 words) of what should appear in the illustration.
- illustration_scene: who is doing what, key objects, composition hint only — no character clothing or appearance details (the server adds those).
- Do not include style suffixes, section headers, or JSON inside illustration_scene.
- Educational usefulness over flashy creativity. Classroom-safe tone.
- If Series Memory has recent_stories, page 1 may open with a brief warm callback to the prior theme (optional, subtle).
- Teacher inputs override Series Memory when they conflict.

JSON schema:
${JSON_SCHEMA}`;
}

export function buildUserPrompt(
  inputs: StoryInputs,
  memory: SeriesMemorySummary
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

  return `Write a 12-page Nina & Nino story.

Required inputs:
- Theme / Topic: ${inputs.theme}
- Learning Goal: ${inputs.learning_goal}
- Vocabulary Focus: ${inputs.vocabulary_focus}
- Main Events: ${inputs.main_events}
${optionalLines.length ? optionalLines.join("\n") + "\n" : ""}
Series Memory (context only — do not block the story if empty):
${memoryJson}`;
}
