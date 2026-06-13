import type { CharacterProfileMap } from "@/lib/character-profiles";
import { formatOfficialCharacterProfilesForStory } from "@/lib/character-profiles/format-for-story-prompt";
import { CHARACTER_BIBLE_EXCERPT } from "@/lib/constants/character-bible";
import {
  formatTopicFirstPlanForPrompt,
  formatWeeklyPlanForPrompt,
  isCompleteWeeklyPlan,
} from "@/lib/story/weekly-plan";
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
  ],
  "inferred_weekly_plan": {
    "week1": { "events": "string", "vocabulary": "string" },
    "week2": { "events": "string", "vocabulary": "string" },
    "week3": { "events": "string", "vocabulary": "string" },
    "week4": { "events": "string", "vocabulary": "string" }
  }
}`;

const COMPLETE_PLAN_STORY_QUALITY_GUIDANCE = `
Story quality (approved four-week plan):

The teacher has approved a complete monthly plan. Follow it strictly by page block:
- Pages 1–3: primarily Week 1 events and vocabulary
- Pages 4–6: primarily Week 2 events and vocabulary
- Pages 7–9: primarily Week 3 events and vocabulary
- Pages 10–12: primarily Week 4 events and vocabulary — include meaningful new Week 4 content before ending

Weeks are internal planning data only (hard rule):
- NEVER write "week 1", "week 2", "first week", "second week", or similar in page text

Planning rules:
- The Topic is the master theme. Every page block must reinforce the Topic.
- Expand teacher guidance into full scenes — do not copy verbatim.
- Do not skip, merge, or significantly delay any week's beat.
- Do not place a later week's primary content in an earlier page block.
- Week 4 should include meaningful new learning — not recap-only or goodbye-only pages.

Story engine, vocabulary, endings, and standalone rules same as topic-first guidance.
`.trim();

const TOPIC_FIRST_STORY_QUALITY_GUIDANCE = `
Story quality (topic-first monthly plan):

The Monthly Topic is the master theme. Plan one connected 12-page story in four 3-page beats:
- Pages 1–3: introduce the Topic, setting, and a clear goal or question
- Pages 4–6: explore and practice within the Topic
- Pages 7–9: a small challenge or deeper learning tied to the Topic
- Pages 10–12: meaningful resolution or new learning with a warm ending

When teacher weekly guidance is missing, invent four connected weekly beats from the Topic and Learning Goal.
When teacher guidance is present, use it as light direction only — expand into full scenes; do not copy verbatim.

Weeks are internal planning data only (hard rule):
- NEVER write "week 1", "week 2", "first week", "second week", "on week three", or similar in page text
- Students read a continuous story — not a weekly schedule

Topic-centered rules:
- Every page block must reinforce the Topic
- The story must read as ONE continuous story — not four disconnected mini-stories
- Week 4 should include meaningful new learning or a final event — not recap-only, goodbye-only, or summary-only pages
- Do not complete the story before pages 10–12

Story engine (required):
- One continuous through-line tied to the Topic and learning goal
- Establish the goal or question by page 3
- Each page should move the story forward

Vocabulary reinforcement:
- Introduce vocabulary naturally through action and dialogue — not as a list
- Do not list vocabulary unnaturally or dump definitions in story text

Endings (pages 10–12):
- Show story feeling through action, dialogue, or a concrete image — not a summary lecture
- Callback to a specific earlier object, action, or moment from this story
- Do NOT use generic closings such as "Everyone was happy", "They learned a lot", or similar vague wrap-ups

Word variety:
- Vary sentence structures; keep language simple for ages 4–6

Supporting adults:
- Use only adults needed for this story; community workers welcome when relevant

Standalone story (strict):
- Every story must be self-contained for students who have never read prior Nina & Nino stories
- Do not reference previous stories unless the teacher explicitly asks in Topic, weekly guidance, or Notes

inferred_weekly_plan (optional in JSON):
- If included, summarize the four weekly beats used (events + vocabulary per week)
`.trim();

const REGENERATE_VARIATION_GUIDANCE = `
REGENERATION REQUEST (strict):
This is a regeneration request. Keep the same Topic, learning goal, weekly guidance, characters, age level, and teacher constraints, but create a substantially different story version.

Variation rules:
- Do not reuse the same page-by-page plot structure as the previous version
- Use a different opening action
- Use a different middle activity or small problem
- Use different dialogue lines
- Use a different ending reflection
- Keep vocabulary naturally integrated
- Avoid copying prior page wording
- Do not contradict teacher inputs; keep classroom safety and standalone story rules
- Keep the topic-first page blocks (pages 1–3 / 4–6 / 7–9 / 10–12)
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

export function buildSystemPrompt(profiles: CharacterProfileMap, inputs?: StoryInputs): string {
  const topicHeader = inputs?.theme.trim()
    ? `\nMonthly Topic for this story (master theme — first priority): ${inputs.theme.trim()}\n`
    : "";

  const useCompletePlan = inputs ? isCompleteWeeklyPlan(inputs.weeklyPlan) : false;
  const qualityGuidance = useCompletePlan
    ? COMPLETE_PLAN_STORY_QUALITY_GUIDANCE
    : TOPIC_FIRST_STORY_QUALITY_GUIDANCE;

  return `You are a children's educational story writer for the Nina & Nino series (ages 4–6).
${topicHeader}
${CHARACTER_BIBLE_EXCERPT}

${formatOfficialCharacterProfilesForStory(profiles)}

Output rules (strict):
- Return ONLY valid JSON matching the schema below. No markdown fences.
- Exactly 12 pages with page_number 1 through 12.
- Each page text: aim for 30–40 words, simple sentences, ages 4–6 readability. A page may be slightly shorter (about 25 words) if the meaning is complete. Do not pad with filler just to meet word count.
- 1–40 vocabulary items drawn from the Topic, Learning Goal, and weekly vocabulary hints when provided.
- One illustration_scene per page: a short visual description (10–50 words) of what should appear in the illustration.
- illustration_scene: who is doing what, key objects, composition hint only — no character clothing or appearance details (the server adds those).
- Do not include style suffixes, section headers, or JSON inside illustration_scene.
- Educational usefulness over flashy creativity. Classroom-safe tone.
- Teacher inputs override Series Memory when they conflict.

${qualityGuidance}

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
  const planBlock = isCompleteWeeklyPlan(inputs.weeklyPlan)
    ? `\n${formatWeeklyPlanForPrompt(inputs.weeklyPlan, inputs.theme, inputs.learning_goal)}\n`
    : `\n${formatTopicFirstPlanForPrompt(
        inputs.theme,
        inputs.learning_goal,
        inputs.weeklyPlan
      )}\n`;
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
- Topic (master theme): ${inputs.theme}
- Learning Goal: ${inputs.learning_goal}
${inputs.vocabulary_focus.trim() ? `- Combined vocabulary hints (all weeks): ${inputs.vocabulary_focus}\n` : ""}${planBlock}${optionalLines.length ? optionalLines.join("\n") + "\n" : ""}
Series Memory (internal continuity only — do NOT reference previous stories in story text):
Use to avoid repeating plots, themes, and vocabulary. Each story must still read standalone for students who have not read prior stories.
${memoryJson}${regenerateBlock}`;
}
