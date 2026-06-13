export type WeekEvent = {
  weekNumber: 1 | 2 | 3 | 4;
  text: string;
  vocabulary: string;
  keywords: string[];
};

export type WeekAdherenceContext = {
  weeklyPlan?: import("@/lib/story/weekly-plan").WeeklyPlan;
  mainEvents?: string;
  topic?: string;
};

export type WeekStructureContext = {
  mainEvents: string;
  topic?: string;
};

export const WEEK_PAGE_BLOCKS: ReadonlyArray<{
  weekNumber: 1 | 2 | 3 | 4;
  startPage: number;
  endPage: number;
}> = [
  { weekNumber: 1, startPage: 1, endPage: 3 },
  { weekNumber: 2, startPage: 4, endPage: 6 },
  { weekNumber: 3, startPage: 7, endPage: 9 },
  { weekNumber: 4, startPage: 10, endPage: 12 },
];

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "to",
  "at",
  "in",
  "on",
  "for",
  "with",
  "about",
  "from",
  "into",
  "through",
  "they",
  "them",
  "their",
  "this",
  "that",
  "then",
  "when",
  "where",
  "while",
  "have",
  "has",
  "had",
  "are",
  "was",
  "were",
  "been",
  "being",
  "will",
  "can",
  "could",
  "would",
  "should",
  "learn",
  "learns",
  "learned",
  "learning",
  "hear",
  "hears",
  "heard",
  "find",
  "finds",
  "found",
  "help",
  "helps",
  "helped",
  "ask",
  "asks",
  "asked",
  "notice",
  "notices",
  "noticed",
  "return",
  "returns",
  "returned",
  "discover",
  "discovers",
  "discovered",
  "ride",
  "rides",
  "arrive",
  "arrives",
  "arrived",
  "get",
  "gets",
  "got",
  "make",
  "makes",
  "made",
  "take",
  "takes",
  "took",
  "see",
  "sees",
  "saw",
  "go",
  "goes",
  "went",
  "come",
  "comes",
  "came",
  "say",
  "says",
  "said",
  "very",
  "also",
  "just",
  "back",
  "over",
  "after",
  "before",
  "into",
  "out",
  "up",
  "down",
  "all",
  "some",
  "many",
  "much",
  "more",
  "most",
  "other",
  "each",
  "both",
  "few",
  "new",
  "old",
  "young",
  "little",
  "big",
  "small",
  "today",
  "now",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "nina",
  "nino",
  "visit",
  "adventure",
  "story",
]);

const TOPIC_STOP_WORDS = new Set([...STOP_WORDS, "visit", "adventure", "story", "day"]);

const RECAP_MARKERS = [
  "learned a lot",
  "they learned",
  "we learned",
  "wonderful day",
  "everyone was happy",
  "great job",
  "what a day",
  "fun day",
  "goodbye",
  "time to go home",
  "remember today",
  "today was",
  "had fun",
  "feeling proud",
  "great day",
  "nice day",
  "summary",
  "memory",
];

/** Story text must never expose internal week planning language to readers. */
const WEEK_LANGUAGE_PATTERNS: RegExp[] = [
  /\bweek\s*[1-4]\b/i,
  /\bweek\s+(one|two|three|four)\b/i,
  /\bWeek\s+(One|Two|Three|Four)\b/,
  /\b(first|second|third|fourth)\s+week\b/i,
  /\bthe\s+(first|second|third|fourth)\s+week\b/i,
  /\bon\s+the\s+(first|second|third|fourth)\s+week\b/i,
  /\bin\s+the\s+(first|second|third|fourth)\s+week\b/i,
  /\bduring\s+the\s+(first|second|third|fourth)\s+week\b/i,
  /\bon\s+week\s+(one|two|three|four|[1-4])\b/i,
  /\bin\s+week\s+(one|two|three|four|[1-4])\b/i,
  /\bduring\s+week\s+(one|two|three|four|[1-4])\b/i,
  /\b(1st|2nd|3rd|4th)\s+week\b/i,
  /\bweek\s+(one|two|three|four)\s+of\b/i,
];

const MAX_KEYWORDS_PER_WEEK = 8;
const KEYWORD_MATCH_RATIO = 0.5;
const WEEK4_RECAP_KEYWORD_RATIO = 0.67;
const PRIMARY_LOCATION_RATIO = 0.6;

/** Generic or topic-shared words — poor signals for week location. */
const GENERIC_WEEK_KEYWORDS = new Set([
  "farm",
  "farms",
  "animal",
  "animals",
  "look",
  "looked",
  "see",
  "saw",
  "go",
  "went",
  "visit",
  "visited",
  "learn",
  "learned",
  "help",
  "helped",
  "fun",
  "play",
  "played",
  "talk",
  "walk",
  "walked",
  "watch",
  "watched",
  "hear",
  "heard",
  "find",
  "found",
  "share",
  "shared",
  "kind",
  "happy",
  "together",
  "friend",
  "friends",
  "day",
  "home",
  "school",
  "park",
  "zoo",
  "party",
  "toy",
  "toys",
  "fire",
  "station",
  "ride",
  "rides",
  "road",
  "field",
  "fields",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function extractWeekKeywords(weekText: string): string[] {
  const seen = new Set<string>();
  const keywords: string[] = [];

  for (const token of tokenize(weekText)) {
    if (token.length < 3 || STOP_WORDS.has(token)) continue;
    if (seen.has(token)) continue;
    seen.add(token);
    keywords.push(token);
  }

  return keywords
    .sort((a, b) => b.length - a.length)
    .slice(0, MAX_KEYWORDS_PER_WEEK);
}

function extractKeyPhrases(weekText: string, topic?: string): string[] {
  const topicWords = topic ? new Set(extractTopicKeywords(topic)) : new Set<string>();
  const phrases: string[] = [];
  const seen = new Set<string>();

  for (const chunk of weekText.split(/[,;.\n]+/)) {
    const tokens = tokenize(chunk).filter(
      (token) =>
        token.length >= 3 && !STOP_WORDS.has(token) && !topicWords.has(token)
    );

    if (tokens.length >= 2) {
      const phrase = tokens.slice(0, 2).join(" ");
      if (!seen.has(phrase)) {
        seen.add(phrase);
        phrases.push(phrase);
      }
    }
    if (tokens.length >= 3) {
      const phrase = tokens.slice(0, 3).join(" ");
      if (!seen.has(phrase)) {
        seen.add(phrase);
        phrases.push(phrase);
      }
    }
  }

  return phrases.slice(0, 4);
}

/** Phrases for location checks — keep topic nouns that anchor the milestone (e.g. "find toy"). */
function extractLocationPhrases(weekText: string, topic?: string): string[] {
  const topicWords = topic ? new Set(extractTopicKeywords(topic)) : new Set<string>();
  const phrases: string[] = [];
  const seen = new Set<string>();

  for (const chunk of weekText.split(/[,;.\n]+/)) {
    const tokens = tokenize(chunk).filter(
      (token) => token.length >= 3 && !STOP_WORDS.has(token)
    );
    const hasDistinctiveToken = tokens.some(
      (token) => !GENERIC_WEEK_KEYWORDS.has(token) && !topicWords.has(token)
    );
    if (!hasDistinctiveToken) continue;

    if (tokens.length >= 2) {
      const phrase = tokens.slice(0, 2).join(" ");
      if (!seen.has(phrase)) {
        seen.add(phrase);
        phrases.push(phrase);
      }
    }
    if (tokens.length >= 3) {
      const phrase = tokens.slice(0, 3).join(" ");
      if (!seen.has(phrase)) {
        seen.add(phrase);
        phrases.push(phrase);
      }
    }
  }

  return phrases.slice(0, 6);
}

/** Contiguous milestone pairs from week text (e.g. "find toy") for boundary checks. */
function extractWeekAnchorPhrases(weekText: string): string[] {
  const tokens = tokenize(weekText);
  const weekLower = weekText.toLowerCase();
  const phrases: string[] = [];
  const seen = new Set<string>();

  for (let index = 0; index < tokens.length - 1; index += 1) {
    const first = tokens[index];
    const second = tokens[index + 1];
    if (first.length < 2 || second.length < 2) continue;
    if (STOP_WORDS.has(first) && STOP_WORDS.has(second)) continue;

    const phrase = `${first} ${second}`;
    if (!weekLower.includes(phrase) || seen.has(phrase)) continue;
    seen.add(phrase);
    phrases.push(phrase);
  }

  return phrases.slice(0, 4);
}

/** Distinctive milestone concepts for location-first validation. */
export function extractDistinctiveWeekKeywords(weekText: string, topic?: string): string[] {
  const topicWords = topic ? new Set(extractTopicKeywords(topic)) : new Set<string>();
  const tokens = extractWeekKeywords(weekText).filter(
    (token) => !GENERIC_WEEK_KEYWORDS.has(token) && !topicWords.has(token)
  );
  const phrases = extractKeyPhrases(weekText, topic);
  const combined = [...phrases, ...tokens];
  const seen = new Set<string>();
  const distinctive: string[] = [];

  for (const entry of combined) {
    const key = entry.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    distinctive.push(entry);
  }

  const fallback = extractWeekKeywords(weekText).slice(0, 3);
  if (distinctive.length === 0) {
    return fallback;
  }

  return distinctive.slice(0, MAX_KEYWORDS_PER_WEEK);
}

export function extractTopicKeywords(topic: string): string[] {
  const seen = new Set<string>();
  const keywords: string[] = [];

  for (const token of tokenize(topic)) {
    if (token.length < 3 || TOPIC_STOP_WORDS.has(token)) continue;
    if (seen.has(token)) continue;
    seen.add(token);
    keywords.push(token);
  }

  if (keywords.length === 0) {
    const fallback = tokenize(topic).find((token) => token.length >= 3);
    if (fallback) keywords.push(fallback);
  }

  return keywords.slice(0, 4);
}

export function weeksFromWeeklyPlan(plan: import("@/lib/story/weekly-plan").WeeklyPlan): WeekEvent[] {
  const entries: Array<[1 | 2 | 3 | 4, keyof import("@/lib/story/weekly-plan").WeeklyPlan]> = [
    [1, "week1"],
    [2, "week2"],
    [3, "week3"],
    [4, "week4"],
  ];

  return entries.map(([weekNumber, key]) => ({
    weekNumber,
    text: plan[key].events.trim(),
    vocabulary: plan[key].vocabulary.trim(),
    keywords: [],
  }));
}

function parseWeekVocabularyTerms(vocabulary: string): string[] {
  return vocabulary
    .split(/[,;]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);
}

export function resolveWeeksFromContext(context: WeekAdherenceContext): WeekEvent[] | null {
  if (context.weeklyPlan) {
    const plan = context.weeklyPlan;
    if (
      [plan.week1, plan.week2, plan.week3, plan.week4].every(
        (week) => week.events.trim() !== ""
      )
    ) {
      return weeksFromWeeklyPlan(plan);
    }
  }

  if (context.mainEvents?.trim()) {
    return parseWeekEvents(context.mainEvents);
  }

  return null;
}

export function parseWeekEvents(mainEvents: string): WeekEvent[] | null {
  const text = mainEvents.trim();
  if (!text) return null;

  const headerPattern = /Week\s*([1-4])\s*:\s*/gi;
  const headers = [...text.matchAll(headerPattern)];
  if (headers.length < 4) return null;

  const weeks: WeekEvent[] = [];

  for (let i = 0; i < headers.length; i++) {
    const match = headers[i];
    const weekNumber = Number(match[1]) as 1 | 2 | 3 | 4;
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd =
      i + 1 < headers.length ? (headers[i + 1].index ?? text.length) : text.length;
    const weekText = text.slice(contentStart, contentEnd).trim();

    if (!weekText) return null;

    weeks.push({
      weekNumber,
      text: weekText,
      vocabulary: "",
      keywords: [],
    });
  }

  const weekNumbers = new Set(weeks.map((week) => week.weekNumber));
  if (weekNumbers.size !== 4) return null;
  for (const n of [1, 2, 3, 4] as const) {
    if (!weekNumbers.has(n)) return null;
  }

  return weeks.sort((a, b) => a.weekNumber - b.weekNumber);
}

export function hasFourWeekStructure(mainEvents: string): boolean {
  return parseWeekEvents(mainEvents) !== null;
}

function keywordMatchesText(keyword: string, haystack: string): boolean {
  const lowerHaystack = haystack.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const escaped = lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const boundaryPattern = new RegExp(`\\b${escaped.replace(/\s+/g, "\\s+")}\\b`, "i");

  if (boundaryPattern.test(lowerHaystack)) return true;

  if (lowerKeyword.endsWith("s") && lowerKeyword.length > 4) {
    const singular = lowerKeyword.slice(0, -1);
    if (new RegExp(`\\b${singular.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(lowerHaystack)) {
      return true;
    }
  } else if (new RegExp(`\\b${escaped}s\\b`, "i").test(lowerHaystack)) {
    return true;
  }

  if (lowerKeyword.endsWith("ies") && lowerKeyword.length > 4) {
    const stem = lowerKeyword.slice(0, -3) + "y";
    if (new RegExp(`\\b${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(lowerHaystack)) {
      return true;
    }
  }

  return false;
}

function countKeywordHitsInPages(
  pages: Array<{ page_number: number; text: string }>,
  keywords: string[],
  startPage: number,
  endPage: number
): number {
  let hits = 0;
  for (const page of pages) {
    if (page.page_number < startPage || page.page_number > endPage) continue;
    for (const keyword of keywords) {
      if (keywordMatchesText(keyword, page.text)) {
        hits++;
        break;
      }
    }
  }
  return hits;
}

function countKeywordHitsPerBlock(
  pages: Array<{ page_number: number; text: string }>,
  keywords: string[]
): Map<number, number> {
  const hits = new Map<number, number>();
  for (const block of WEEK_PAGE_BLOCKS) {
    hits.set(block.weekNumber, 0);
  }

  for (const page of pages) {
    const block = WEEK_PAGE_BLOCKS.find(
      (entry) => page.page_number >= entry.startPage && page.page_number <= entry.endPage
    );
    if (!block) continue;

    for (const keyword of keywords) {
      if (keywordMatchesText(keyword, page.text)) {
        hits.set(block.weekNumber, (hits.get(block.weekNumber) ?? 0) + 1);
        break;
      }
    }
  }

  return hits;
}

function countKeywordHitsPerBlockForKeyword(
  pages: Array<{ page_number: number; text: string }>,
  keyword: string
): Map<number, number> {
  const hits = new Map<number, number>();
  for (const block of WEEK_PAGE_BLOCKS) {
    hits.set(block.weekNumber, 0);
  }

  for (const page of pages) {
    const block = WEEK_PAGE_BLOCKS.find(
      (entry) => page.page_number >= entry.startPage && page.page_number <= entry.endPage
    );
    if (!block || !keywordMatchesText(keyword, page.text)) continue;
    hits.set(block.weekNumber, (hits.get(block.weekNumber) ?? 0) + 1);
  }

  return hits;
}

function getAssignedBlock(weekNumber: 1 | 2 | 3 | 4) {
  return WEEK_PAGE_BLOCKS[weekNumber - 1];
}

function findEarliestPageWithKeyword(
  pages: Array<{ page_number: number; text: string }>,
  keyword: string
): number | null {
  for (const page of pages.sort((a, b) => a.page_number - b.page_number)) {
    if (keywordMatchesText(keyword, page.text)) {
      return page.page_number;
    }
  }
  return null;
}

function requiredKeywordMatches(keywordCount: number, ratio = KEYWORD_MATCH_RATIO): number {
  if (keywordCount === 0) return 0;
  return Math.max(1, Math.ceil(keywordCount * ratio));
}

function countKeywordMatches(keywords: string[], blockText: string): number {
  if (keywords.length === 0) return 0;
  return keywords.filter((keyword) => keywordMatchesText(keyword, blockText)).length;
}

function filterKeywordsNotInPriorWeeks(
  keywords: string[],
  week: WeekEvent,
  allWeeks: WeekEvent[]
): string[] {
  const priorText = allWeeks
    .filter((entry) => entry.weekNumber < week.weekNumber)
    .map((entry) => entry.text.toLowerCase())
    .join(" ");

  const filtered = keywords.filter((keyword) => {
    const lower = keyword.toLowerCase();
    if (priorText.includes(lower)) return false;
    const parts = lower.split(/\s+/).filter((part) => part.length >= 3);
    if (parts.length > 1 && parts.every((part) => priorText.includes(part))) return false;
    return true;
  });

  return filtered;
}

function getDistinctiveKeywords(week: WeekEvent, topic?: string): string[] {
  return week.keywords.length > 0
    ? week.keywords
    : extractDistinctiveWeekKeywords(week.text, topic);
}

function filterTopicNoise(keywords: string[], topic?: string, keepAnchors: string[] = []): string[] {
  const topicWords = topic ? new Set(extractTopicKeywords(topic)) : new Set<string>();
  const anchorSet = new Set(keepAnchors.map((entry) => entry.toLowerCase()));
  const filtered: string[] = [];
  const seen = new Set<string>();

  for (const entry of keywords) {
    const key = entry.toLowerCase();
    if (seen.has(key)) continue;
    if (topicWords.has(key)) continue;
    const parts = key.split(/\s+/);
    if (parts.length === 1 && (topicWords.has(key) || GENERIC_WEEK_KEYWORDS.has(key))) {
      continue;
    }
    if (
      parts.length > 1 &&
      parts.every((part) => topicWords.has(part) || GENERIC_WEEK_KEYWORDS.has(part)) &&
      !anchorSet.has(key)
    ) {
      continue;
    }
    seen.add(key);
    filtered.push(entry);
  }

  return filtered;
}

function getPlacementKeywords(week: WeekEvent, allWeeks: WeekEvent[], topic?: string): string[] {
  const tokens = filterKeywordsNotInPriorWeeks(getDistinctiveKeywords(week, topic), week, allWeeks);
  const phrases = filterKeywordsNotInPriorWeeks(extractLocationPhrases(week.text, topic), week, allWeeks);
  return filterTopicNoise([...phrases, ...tokens], topic).slice(0, MAX_KEYWORDS_PER_WEEK);
}

function getBoundaryKeywords(week: WeekEvent, allWeeks: WeekEvent[], topic?: string): string[] {
  const placement = getPlacementKeywords(week, allWeeks, topic);
  const anchors = filterKeywordsNotInPriorWeeks(extractWeekAnchorPhrases(week.text), week, allWeeks);
  const seen = new Set<string>();
  const combined: string[] = [];

  for (const entry of [...placement, ...anchors]) {
    const key = entry.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    combined.push(entry);
  }

  return combined.slice(0, MAX_KEYWORDS_PER_WEEK);
}

/** Placement signals plus milestone anchors, excluding topic-only pairs (e.g. "lost toy"). */
function getMisplacedKeywords(week: WeekEvent, allWeeks: WeekEvent[], topic?: string): string[] {
  const topicWords = topic ? new Set(extractTopicKeywords(topic)) : new Set<string>();
  const placement = getPlacementKeywords(week, allWeeks, topic);
  const anchors = filterKeywordsNotInPriorWeeks(extractWeekAnchorPhrases(week.text), week, allWeeks).filter(
    (anchor) => {
      const parts = anchor.toLowerCase().split(/\s+/);
      return !parts.every((part) => topicWords.has(part));
    }
  );
  const seen = new Set<string>();
  const combined: string[] = [];

  for (const entry of [...placement, ...anchors]) {
    const key = entry.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    combined.push(entry);
  }

  return combined.slice(0, MAX_KEYWORDS_PER_WEEK);
}

function countRecapMarkers(text: string): number {
  const lower = text.toLowerCase();
  return RECAP_MARKERS.filter((marker) => lower.includes(marker)).length;
}

function getPageBlockText(
  pages: Array<{ page_number: number; text: string }>,
  startPage: number,
  endPage: number
): string {
  return pages
    .filter((page) => page.page_number >= startPage && page.page_number <= endPage)
    .sort((a, b) => a.page_number - b.page_number)
    .map((page) => page.text)
    .join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractPages(raw: unknown): Array<{ page_number: number; text: string }> | null {
  if (!isRecord(raw) || !Array.isArray(raw.pages)) return null;

  const pages: Array<{ page_number: number; text: string }> = [];
  for (const page of raw.pages) {
    if (!isRecord(page)) continue;
    const pageNumber = page.page_number;
    const text = typeof page.text === "string" ? page.text.trim() : "";
    if (typeof pageNumber === "number" && text) {
      pages.push({ page_number: pageNumber, text });
    }
  }

  return pages.length === 12 ? pages : null;
}

export type WeekStructureValidationResult =
  | { ok: true }
  | { ok: false; reason: string; failedWeek?: number };

function validateTopicContinuity(
  pages: Array<{ page_number: number; text: string }>,
  topic: string
): WeekStructureValidationResult {
  const topicKeywords = extractTopicKeywords(topic);
  if (topicKeywords.length === 0) {
    return { ok: true };
  }

  for (const block of WEEK_PAGE_BLOCKS) {
    const blockText = getPageBlockText(pages, block.startPage, block.endPage);
    const hasTopic = topicKeywords.some((keyword) => keywordMatchesText(keyword, blockText));
    if (!hasTopic) {
      return {
        ok: false,
        reason: `pages ${block.startPage}-${block.endPage} must stay connected to Topic "${topic.trim()}" (missing topic anchor)`,
        failedWeek: block.weekNumber,
      };
    }
  }

  const pagesWithTopic = pages.filter((page) =>
    topicKeywords.some((keyword) => keywordMatchesText(keyword, page.text))
  );
  if (pagesWithTopic.length < 10) {
    return {
      ok: false,
      reason: `Topic "${topic.trim()}" must remain visible throughout the story (too few pages reference the Topic)`,
    };
  }

  return { ok: true };
}

function validateWeekBoundaryStrictness(
  pages: Array<{ page_number: number; text: string }>,
  weeks: WeekEvent[],
  topic?: string
): WeekStructureValidationResult {
  const boundaryStart: Record<1 | 2 | 3 | 4, number> = { 1: 1, 2: 4, 3: 7, 4: 10 };

  for (const week of weeks) {
    const keywords = getBoundaryKeywords(week, weeks, topic);
    if (keywords.length === 0) continue;

    const minPage = boundaryStart[week.weekNumber];
    for (const keyword of keywords) {
      const earliest = findEarliestPageWithKeyword(pages, keyword);
      if (earliest !== null && earliest < minPage) {
        return {
          ok: false,
          reason: `page ${earliest} contains Week ${week.weekNumber} milestone "${keyword}" before page ${minPage}`,
          failedWeek: week.weekNumber,
        };
      }
    }
  }

  return { ok: true };
}

function validateMisplacedKeywords(
  pages: Array<{ page_number: number; text: string }>,
  weeks: WeekEvent[],
  topic?: string
): WeekStructureValidationResult {
  for (const week of weeks) {
    const keywords = getMisplacedKeywords(week, weeks, topic);
    if (keywords.length === 0) continue;

    const assignedBlock = getAssignedBlock(week.weekNumber);

    for (const keyword of keywords) {
      const hitsPerBlock = countKeywordHitsPerBlockForKeyword(pages, keyword);
      const assignedHits = hitsPerBlock.get(week.weekNumber) ?? 0;
      const totalHits = [...hitsPerBlock.values()].reduce((sum, count) => sum + count, 0);
      if (totalHits === 0) continue;

      for (const block of WEEK_PAGE_BLOCKS) {
        if (block.weekNumber === week.weekNumber) continue;
        const otherHits = hitsPerBlock.get(block.weekNumber) ?? 0;
        if (otherHits > assignedHits) {
          return {
            ok: false,
            reason: `Week ${week.weekNumber} concept "${keyword}" appears primarily on pages ${block.startPage}-${block.endPage} instead of pages ${assignedBlock.startPage}-${assignedBlock.endPage}`,
            failedWeek: week.weekNumber,
          };
        }
        if (otherHits > 0 && assignedHits === 0) {
          return {
            ok: false,
            reason: `Week ${week.weekNumber} concept "${keyword}" appears on pages ${block.startPage}-${block.endPage} but not in assigned block pages ${assignedBlock.startPage}-${assignedBlock.endPage}`,
            failedWeek: week.weekNumber,
          };
        }
      }
    }
  }

  return { ok: true };
}

function validatePrimaryLocationRatio(
  pages: Array<{ page_number: number; text: string }>,
  weeks: WeekEvent[],
  topic?: string
): WeekStructureValidationResult {
  for (const week of weeks) {
    const keywords = getMisplacedKeywords(week, weeks, topic);
    if (keywords.length === 0) continue;

    const assignedBlock = getAssignedBlock(week.weekNumber);
    const hitsPerBlock = countKeywordHitsPerBlock(pages, keywords);
    const totalHits = [...hitsPerBlock.values()].reduce((sum, count) => sum + count, 0);
    if (totalHits === 0) continue;

    const assignedHits = hitsPerBlock.get(week.weekNumber) ?? 0;
    const assignedRatio = assignedHits / totalHits;

    if (assignedRatio < PRIMARY_LOCATION_RATIO) {
      return {
        ok: false,
        reason: `Week ${week.weekNumber} distinctive concepts are not primarily on pages ${assignedBlock.startPage}-${assignedBlock.endPage} (${Math.round(assignedRatio * 100)}% in assigned block, need ${Math.round(PRIMARY_LOCATION_RATIO * 100)}%)`,
        failedWeek: week.weekNumber,
      };
    }

    for (const block of WEEK_PAGE_BLOCKS) {
      if (block.weekNumber === week.weekNumber) continue;
      const otherHits = hitsPerBlock.get(block.weekNumber) ?? 0;
      if (otherHits >= assignedHits) {
        return {
          ok: false,
          reason: `Week ${week.weekNumber} content has equal or greater presence on pages ${block.startPage}-${block.endPage} than on pages ${assignedBlock.startPage}-${assignedBlock.endPage}`,
          failedWeek: week.weekNumber,
        };
      }
    }
  }

  return { ok: true };
}

function validateWeek1NotPrimaryAfterPage3(
  pages: Array<{ page_number: number; text: string }>,
  week1: WeekEvent,
  weeks: WeekEvent[],
  topic?: string
): WeekStructureValidationResult {
  const keywords = getPlacementKeywords(week1, weeks, topic);
  if (keywords.length === 0) return { ok: true };

  const earlyHits = countKeywordHitsInPages(pages, keywords, 1, 3);
  const lateHits = countKeywordHitsInPages(pages, keywords, 4, 12);

  if (lateHits > earlyHits && earlyHits > 0) {
    return {
      ok: false,
      reason: "Week 1 milestones appear primarily after page 3",
      failedWeek: 1,
    };
  }

  return { ok: true };
}

function validateWeekBlockCoverage(
  pages: Array<{ page_number: number; text: string }>,
  weeks: WeekEvent[],
  topic?: string
): WeekStructureValidationResult {
  for (const block of WEEK_PAGE_BLOCKS) {
    const week = weeks.find((entry) => entry.weekNumber === block.weekNumber);
    if (!week) continue;

    const blockText = getPageBlockText(pages, block.startPage, block.endPage);
    const keywords = getDistinctiveKeywords(week, topic);
    const requiredMatches = requiredKeywordMatches(keywords.length);
    const matches = countKeywordMatches(keywords, blockText);

    if (keywords.length > 0 && matches < requiredMatches) {
      const missing = keywords.filter((keyword) => !keywordMatchesText(keyword, blockText));
      return {
        ok: false,
        reason: `pages ${block.startPage}-${block.endPage} must primarily cover Week ${block.weekNumber} (missing concepts: ${missing.slice(0, 4).join(", ")})`,
        failedWeek: block.weekNumber,
      };
    }
  }

  return { ok: true };
}

function validateWeek4MeaningfulContent(
  pages: Array<{ page_number: number; text: string }>,
  week4: WeekEvent,
  weeks: WeekEvent[],
  topic?: string
): WeekStructureValidationResult {
  const finalText = getPageBlockText(pages, 10, 12);
  const week4Keywords = getPlacementKeywords(week4, weeks, topic);
  const finalMatches = countKeywordMatches(week4Keywords, finalText);
  const recapCount = countRecapMarkers(finalText);
  const strictRequired = requiredKeywordMatches(week4Keywords.length, WEEK4_RECAP_KEYWORD_RATIO);

  if (recapCount >= 2 && finalMatches < strictRequired) {
    return {
      ok: false,
      reason:
        "pages 10-12 must contain meaningful Week 4 new content, not recap-only or goodbye pages",
      failedWeek: 4,
    };
  }

  if (recapCount >= 1 && finalMatches < requiredKeywordMatches(week4Keywords.length)) {
    return {
      ok: false,
      reason:
        "pages 10-12 must include a final discovery, learning moment, or event — not reflection-only or summary-only",
      failedWeek: 4,
    };
  }

  return { ok: true };
}

function findWeekLanguageLeak(
  pages: Array<{ page_number: number; text: string }>
): WeekStructureValidationResult {
  for (const page of pages) {
    for (const pattern of WEEK_LANGUAGE_PATTERNS) {
      const match = page.text.match(pattern);
      if (match) {
        return {
          ok: false,
          reason: `page ${page.page_number} exposes internal week planning language ("${match[0]}") — weeks are teacher-only, never shown to readers`,
        };
      }
    }
  }

  return { ok: true };
}

function validateWeekVocabularyPlacement(
  pages: Array<{ page_number: number; text: string }>,
  weeks: WeekEvent[],
  topic?: string
): WeekStructureValidationResult {
  const boundaryStart: Record<1 | 2 | 3 | 4, number> = { 1: 1, 2: 4, 3: 7, 4: 10 };
  const topicWords = topic ? new Set(extractTopicKeywords(topic)) : new Set<string>();

  for (const week of weeks) {
    const rawTerms = parseWeekVocabularyTerms(week.vocabulary).filter((term) => {
      const lower = term.toLowerCase();
      return !topicWords.has(lower) && !GENERIC_WEEK_KEYWORDS.has(lower);
    });
    const priorVocab = weeks
      .filter((entry) => entry.weekNumber < week.weekNumber)
      .map((entry) => entry.vocabulary.toLowerCase())
      .join(", ");
    const terms = rawTerms.filter((term) => !priorVocab.includes(term.toLowerCase()));
    if (terms.length === 0) continue;

    const assignedBlock = getAssignedBlock(week.weekNumber);
    const minPage = boundaryStart[week.weekNumber];

    for (const term of terms) {
      const earliest = findEarliestPageWithKeyword(pages, term);
      if (earliest !== null && earliest < minPage) {
        return {
          ok: false,
          reason: `page ${earliest} contains Week ${week.weekNumber} vocabulary "${term}" before page ${minPage}`,
          failedWeek: week.weekNumber,
        };
      }
    }

    const hitsPerBlock = countKeywordHitsPerBlock(pages, terms);
    const totalHits = [...hitsPerBlock.values()].reduce((sum, count) => sum + count, 0);
    if (totalHits === 0) continue;

    const assignedHits = hitsPerBlock.get(week.weekNumber) ?? 0;
    const assignedRatio = assignedHits / totalHits;

    if (assignedRatio < PRIMARY_LOCATION_RATIO) {
      return {
        ok: false,
        reason: `Week ${week.weekNumber} vocabulary is not primarily on pages ${assignedBlock.startPage}-${assignedBlock.endPage} (${Math.round(assignedRatio * 100)}% in assigned block, need ${Math.round(PRIMARY_LOCATION_RATIO * 100)}%)`,
        failedWeek: week.weekNumber,
      };
    }

    for (const block of WEEK_PAGE_BLOCKS) {
      if (block.weekNumber === week.weekNumber) continue;
      const otherHits = hitsPerBlock.get(block.weekNumber) ?? 0;
      if (otherHits >= assignedHits) {
        return {
          ok: false,
          reason: `Week ${week.weekNumber} vocabulary has equal or greater presence on pages ${block.startPage}-${block.endPage} than on pages ${assignedBlock.startPage}-${assignedBlock.endPage}`,
          failedWeek: week.weekNumber,
        };
      }
    }
  }

  return { ok: true };
}

export function validateWeekAdherence(
  raw: unknown,
  context: WeekAdherenceContext
): WeekStructureValidationResult {
  const weeks = resolveWeeksFromContext(context);
  if (!weeks) return { ok: true };

  const pages = extractPages(raw);
  if (!pages) {
    return { ok: false, reason: "week adherence validation requires 12 valid pages" };
  }

  return validateWeekAdherencePages(pages, weeks, context.topic);
}

export function validateWeekAdherencePages(
  pages: Array<{ page_number: number; text: string }>,
  weeks: WeekEvent[],
  topic?: string
): WeekStructureValidationResult {
  const languageCheck = findWeekLanguageLeak(pages);
  if (!languageCheck.ok) {
    return languageCheck;
  }

  const boundaryCheck = validateWeekBoundaryStrictness(pages, weeks, topic);
  if (!boundaryCheck.ok) {
    return boundaryCheck;
  }

  const misplacedCheck = validateMisplacedKeywords(pages, weeks, topic);
  if (!misplacedCheck.ok) {
    return misplacedCheck;
  }

  const vocabularyCheck = validateWeekVocabularyPlacement(pages, weeks, topic);
  if (!vocabularyCheck.ok) {
    return vocabularyCheck;
  }

  const locationCheck = validatePrimaryLocationRatio(pages, weeks, topic);
  if (!locationCheck.ok) {
    return locationCheck;
  }

  const week1 = weeks.find((week) => week.weekNumber === 1);
  if (week1) {
    const week1Check = validateWeek1NotPrimaryAfterPage3(pages, week1, weeks, topic);
    if (!week1Check.ok) {
      return week1Check;
    }
  }

  if (topic?.trim()) {
    const topicCheck = validateTopicContinuity(pages, topic);
    if (!topicCheck.ok) {
      return topicCheck;
    }
  }

  const coverageCheck = validateWeekBlockCoverage(pages, weeks, topic);
  if (!coverageCheck.ok) {
    return coverageCheck;
  }

  const week4 = weeks.find((week) => week.weekNumber === 4);
  if (week4) {
    const week4ContentCheck = validateWeek4MeaningfulContent(pages, week4, weeks, topic);
    if (!week4ContentCheck.ok) {
      return week4ContentCheck;
    }
  }

  return { ok: true };
}

/** Hard validation: week planning language must never appear in story text. */
export function validateNoWeekLanguageInText(raw: unknown): WeekStructureValidationResult {
  const pages = extractPages(raw);
  if (!pages) {
    return { ok: false, reason: "week language validation requires 12 valid pages" };
  }
  return findWeekLanguageLeak(pages);
}

export function validateWeekStructure(
  raw: unknown,
  mainEvents: string,
  topic?: string
): WeekStructureValidationResult {
  return validateWeekAdherence(raw, { mainEvents, topic });
}

export function formatWeekStructureForPrompt(mainEvents: string, topic?: string): string | null {
  const weeks = parseWeekEvents(mainEvents);
  if (!weeks) return null;

  const topicLine = topic?.trim()
    ? `Topic (master theme — monthly umbrella): ${topic.trim()}
Every week is Theme 1–4 inside this one continuous Topic-centered story.
Every page must connect to the Topic. Each week must reinforce the Topic.`
    : "";

  const lines = weeks.map(
    (week) =>
      `- Week ${week.weekNumber} (Theme ${week.weekNumber}) → Pages ${WEEK_PAGE_BLOCKS[week.weekNumber - 1].startPage}–${WEEK_PAGE_BLOCKS[week.weekNumber - 1].endPage}: ${week.text}`
  );

  return `TOPIC-CENTERED FOUR-WEEK STRUCTURE (mandatory milestones — not optional guidance):
${topicLine ? `${topicLine}\n\n` : ""}Page mapping (strict):
${lines.join("\n")}

Rules (strict):
- Topic-centered 4-week structure is a hard requirement.
- Each 3-page block MUST primarily cover its assigned week inside the Topic.
- You MAY expand with dialogue, educational detail, transitions, and supporting scenes within each block.
- You MUST NOT skip, merge, delay, or replace any week's core event.
- Do NOT complete the story before Week 4 content on pages 10–12.
- Week 4 must contain meaningful NEW learning or a final event — not recap-only, goodbye, memory, or summary pages.
- Do NOT place major events from later weeks in earlier blocks.
- Keep scenes anchored to the Topic (e.g., a tractor ride happens on the farm, not as a generic disconnected ride).`;
}

export function formatWeekStructureRepairPrompt(
  parsed: unknown,
  mainEvents: string,
  reason: string,
  topic?: string
): string {
  const weekBlock = formatWeekStructureForPrompt(mainEvents, topic) ?? mainEvents;
  return formatWeekAdherenceRepairPrompt(parsed, reason, weekBlock, topic);
}

export function formatWeekAdherenceRepairPrompt(
  parsed: unknown,
  reason: string,
  planBlock: string,
  topic?: string
): string {
  const topicReminder = topic?.trim()
    ? `\nTopic (master theme): ${topic.trim()} — every page must stay connected to this Topic.`
    : "";

  return `The story JSON below failed week adherence validation: ${reason}
${topicReminder}

${planBlock}

Repair instructions (structure first — do not regenerate the entire story unless necessary):
- Move each week's distinctive concepts into the correct page block: pages 1–3 = Week 1, pages 4–6 = Week 2, pages 7–9 = Week 3, pages 10–12 = Week 4
- Remove ALL week planning language from story text (no "week 1", "first week", "in the second week", "on the third week", etc.) — weeks are internal teacher planning only; the story must read naturally for children
- Do NOT mention weeks, week numbers, or weekly schedules anywhere in page text
- Preserve vocabulary integration, learning goal, age level (4–6), character continuity, page count, title, and illustration_scene fields
- Week 4 must include meaningful new learning or a final event — not recap-only, goodbye-only, or summary-only pages
- Later-week milestones must not appear before their page block (Week 4 concepts must not appear before page 10)
- Minor callbacks to earlier events are fine; primary week milestones must stay in their assigned blocks

Return the complete corrected JSON object only.

Story JSON:
${JSON.stringify(parsed)}`;
}

export function detectWeekLanguageInText(text: string): string | null {
  for (const pattern of WEEK_LANGUAGE_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}
