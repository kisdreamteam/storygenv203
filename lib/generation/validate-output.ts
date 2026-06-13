import type { MockGenerationResult, StoryInputs } from "./types";
import {
  isCompleteWeeklyPlan,
  normalizeWeeklyPlan,
  type WeeklyPlan,
} from "@/lib/story/weekly-plan";
import { validateNoWeekLanguageInText } from "./week-structure";
const PAGE_COUNT = 12;
export const MIN_WORDS_PER_PAGE = 25;
const MAX_WORDS_PER_PAGE = 55;
const MIN_SCENE_WORDS = 10;
const MAX_SCENE_WORDS = 50;
const MIN_VOCAB = 1;
const MAX_VOCAB = 40;
const MAX_TITLE_LENGTH = 60;

type ValidationOptions = {
  skipPageWordMin?: boolean;
};

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseInferredWeeklyPlan(raw: Record<string, unknown>): WeeklyPlan | undefined {
  if (raw.inferred_weekly_plan === undefined) {
    return undefined;
  }
  return normalizeWeeklyPlan(raw.inferred_weekly_plan);
}

function weeklyPlanNeedsInference(plan: WeeklyPlan): boolean {
  return !isCompleteWeeklyPlan(plan);
}

function validateInferredWeeklyPlan(
  raw: Record<string, unknown>,
  inputs: StoryInputs
): ValidationResult | null {
  if (!weeklyPlanNeedsInference(inputs.weeklyPlan)) {
    return null;
  }

  const inferred = parseInferredWeeklyPlan(raw);
  if (!inferred) {
    return { ok: false, reason: "missing inferred_weekly_plan for topic-first generation" };
  }

  if (!isCompleteWeeklyPlan(inferred)) {
    return { ok: false, reason: "inferred_weekly_plan must include events for all four weeks" };
  }

  return null;
}

export type ValidationResult =
  | { ok: true; result: MockGenerationResult }
  | { ok: false; reason: string };

function validateGenerationOutputInternal(
  raw: unknown,
  options?: ValidationOptions
): ValidationResult {
  if (!isRecord(raw)) {
    return { ok: false, reason: "response is not a JSON object" };
  }

  const storyRaw = raw.story;
  if (!isRecord(storyRaw) || typeof storyRaw.title !== "string") {
    return { ok: false, reason: "missing story.title string" };
  }

  const title = storyRaw.title.trim();
  if (!title) {
    return { ok: false, reason: "story.title is empty" };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { ok: false, reason: `story.title exceeds ${MAX_TITLE_LENGTH} characters` };
  }

  if (!Array.isArray(raw.pages)) {
    return { ok: false, reason: "pages must be an array" };
  }
  if (raw.pages.length !== PAGE_COUNT) {
    return { ok: false, reason: `expected ${PAGE_COUNT} pages, got ${raw.pages.length}` };
  }

  const pages: MockGenerationResult["pages"] = [];
  const seenPageNumbers = new Set<number>();

  for (let i = 0; i < raw.pages.length; i++) {
    const page = raw.pages[i];
    if (!isRecord(page)) {
      return { ok: false, reason: `page ${i + 1} is not an object` };
    }

    const pageNumber = page.page_number;
    const text = typeof page.text === "string" ? page.text.trim() : "";
    const illustrationScene =
      typeof page.illustration_scene === "string" ? page.illustration_scene.trim() : "";

    if (typeof pageNumber !== "number" || pageNumber < 1 || pageNumber > PAGE_COUNT) {
      return { ok: false, reason: `invalid page_number on page index ${i}` };
    }
    if (seenPageNumbers.has(pageNumber)) {
      return { ok: false, reason: `duplicate page_number ${pageNumber}` };
    }
    seenPageNumbers.add(pageNumber);

    if (!text) {
      return { ok: false, reason: `page ${pageNumber} text is empty` };
    }
    const words = wordCount(text);
    if (!options?.skipPageWordMin && words < MIN_WORDS_PER_PAGE) {
      return {
        ok: false,
        reason: `page ${pageNumber} has ${words} words (expected ${MIN_WORDS_PER_PAGE}–${MAX_WORDS_PER_PAGE})`,
      };
    }
    if (words > MAX_WORDS_PER_PAGE) {
      return {
        ok: false,
        reason: `page ${pageNumber} has ${words} words (expected ${MIN_WORDS_PER_PAGE}–${MAX_WORDS_PER_PAGE})`,
      };
    }
    if (!illustrationScene) {
      return { ok: false, reason: `page ${pageNumber} illustration_scene is empty` };
    }
    const sceneWords = wordCount(illustrationScene);
    if (sceneWords < MIN_SCENE_WORDS || sceneWords > MAX_SCENE_WORDS) {
      return {
        ok: false,
        reason: `page ${pageNumber} illustration_scene has ${sceneWords} words (expected ${MIN_SCENE_WORDS}–${MAX_SCENE_WORDS})`,
      };
    }

    pages.push({
      page_number: pageNumber,
      text,
      illustration_prompt: illustrationScene,
    });
  }

  pages.sort((a, b) => a.page_number - b.page_number);

  if (!Array.isArray(raw.vocabulary)) {
    return { ok: false, reason: "vocabulary must be an array" };
  }
  if (raw.vocabulary.length < MIN_VOCAB || raw.vocabulary.length > MAX_VOCAB) {
    return {
      ok: false,
      reason: `expected ${MIN_VOCAB}–${MAX_VOCAB} vocabulary items, got ${raw.vocabulary.length}`,
    };
  }

  const vocabulary: MockGenerationResult["vocabulary"] = [];
  for (let i = 0; i < raw.vocabulary.length; i++) {
    const item = raw.vocabulary[i];
    if (!isRecord(item)) {
      return { ok: false, reason: `vocabulary item ${i + 1} is not an object` };
    }
    const word = typeof item.word === "string" ? item.word.trim() : "";
    const definition =
      typeof item.definition_or_example === "string"
        ? item.definition_or_example.trim()
        : "";
    const sortOrder = item.sort_order;

    if (!word || !definition) {
      return { ok: false, reason: `vocabulary item ${i + 1} missing word or definition` };
    }
    if (typeof sortOrder !== "number" || sortOrder < 1) {
      return { ok: false, reason: `vocabulary item ${i + 1} has invalid sort_order` };
    }

    vocabulary.push({
      word,
      definition_or_example: definition,
      sort_order: sortOrder,
    });
  }

  vocabulary.sort((a, b) => a.sort_order - b.sort_order);

  const inferred_weekly_plan = isRecord(raw) ? parseInferredWeeklyPlan(raw) : undefined;

  return {
    ok: true,
    result: {
      story: { title, status: "draft" },
      pages,
      vocabulary,
      inferred_weekly_plan,
    },
  };
}

export function validateGenerationOutput(raw: unknown): ValidationResult {
  return validateGenerationOutputInternal(raw);
}

export function validateGenerationOutputWithWeeks(
  raw: unknown,
  mainEventsOrInputs: string | StoryInputs
): ValidationResult {
  const structural = validateGenerationOutputInternal(raw);
  if (!structural.ok) {
    return structural;
  }

  if (typeof mainEventsOrInputs !== "string" && isRecord(raw)) {
    const inferredCheck = validateInferredWeeklyPlan(raw, mainEventsOrInputs);
    if (inferredCheck) {
      return inferredCheck;
    }
  }

  const weekLanguageCheck = validateNoWeekLanguageInText(raw);
  if (!weekLanguageCheck.ok) {
    return { ok: false, reason: weekLanguageCheck.reason };
  }

  return structural;
}

export function getShortPageNumbers(raw: unknown): number[] {
  if (!isRecord(raw) || !Array.isArray(raw.pages)) {
    return [];
  }

  const shortPages: number[] = [];
  for (const page of raw.pages) {
    if (!isRecord(page)) continue;
    const pageNumber = page.page_number;
    const text = typeof page.text === "string" ? page.text.trim() : "";
    if (
      typeof pageNumber === "number" &&
      pageNumber >= 1 &&
      pageNumber <= PAGE_COUNT &&
      text &&
      wordCount(text) < MIN_WORDS_PER_PAGE
    ) {
      shortPages.push(pageNumber);
    }
  }

  return shortPages.sort((a, b) => a - b);
}

export function isRepairableShortPageFailure(raw: unknown): boolean {
  if (getShortPageNumbers(raw).length === 0) {
    return false;
  }

  const relaxed = validateGenerationOutputInternal(raw, { skipPageWordMin: true });
  if (!relaxed.ok) {
    return false;
  }

  return !validateGenerationOutput(raw).ok;
}

export function isRepairableWeekStructureFailure(raw: unknown): boolean {
  const structural = validateGenerationOutputInternal(raw);
  if (!structural.ok) {
    return false;
  }
  return !validateNoWeekLanguageInText(raw).ok;
}
