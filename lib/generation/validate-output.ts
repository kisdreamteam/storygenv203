import type { MockGenerationResult } from "./types";

const PAGE_COUNT = 12;
const MIN_WORDS_PER_PAGE = 20;
const MAX_WORDS_PER_PAGE = 55;
const MIN_VOCAB = 5;
const MAX_VOCAB = 7;
const MAX_TITLE_LENGTH = 60;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type ValidationResult =
  | { ok: true; result: MockGenerationResult }
  | { ok: false; reason: string };

export function validateGenerationOutput(raw: unknown): ValidationResult {
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
    const illustrationPrompt =
      typeof page.illustration_prompt === "string" ? page.illustration_prompt.trim() : "";

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
    if (words < MIN_WORDS_PER_PAGE || words > MAX_WORDS_PER_PAGE) {
      return {
        ok: false,
        reason: `page ${pageNumber} has ${words} words (expected ${MIN_WORDS_PER_PAGE}–${MAX_WORDS_PER_PAGE})`,
      };
    }
    if (!illustrationPrompt) {
      return { ok: false, reason: `page ${pageNumber} illustration_prompt is empty` };
    }

    pages.push({
      page_number: pageNumber,
      text,
      illustration_prompt: illustrationPrompt,
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

  return {
    ok: true,
    result: {
      story: { title, status: "draft" },
      pages,
      vocabulary,
    },
  };
}
