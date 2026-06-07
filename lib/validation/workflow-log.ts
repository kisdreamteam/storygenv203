/**
 * Validation instrumentation only — not product analytics.
 * Console events for teacher pilot observation. No external services, DB, or cookies.
 */

export type WorkflowEvent =
  | "story_create_page_opened"
  | "story_generate_clicked"
  | "story_generate_completed"
  | "story_save_clicked"
  | "story_save_completed"
  | "story_page_opened"
  | "story_reopened"
  | "second_story_created";

type WorkflowDetail = Record<string, string | number | boolean | null | undefined>;

const LOG_PREFIX = "[StoryGen:pilot]";

let generateCount = 0;
let saveClickCount = 0;
let saveCompleteCount = 0;

function seenStoryIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const raw = sessionStorage.getItem("storygen_pilot_seen_stories");
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function rememberStoryId(storyId: string) {
  const seen = seenStoryIds();
  seen.add(storyId);
  sessionStorage.setItem("storygen_pilot_seen_stories", JSON.stringify([...seen]));
}

export function logWorkflowEvent(event: WorkflowEvent, detail?: WorkflowDetail) {
  if (typeof window === "undefined") return;

  const payload = {
    event,
    at: new Date().toISOString(),
    ts: Date.now(),
    ...detail,
  };

  console.info(LOG_PREFIX, payload);
}

export function logStoryCreatePageOpened() {
  logWorkflowEvent("story_create_page_opened");
}

export function logStoryGenerateClicked() {
  logWorkflowEvent("story_generate_clicked", { generateCountBefore: generateCount });
}

export function logStoryGenerateCompleted(
  storyId: string,
  durationMs: number
) {
  generateCount += 1;
  logWorkflowEvent("story_generate_completed", {
    storyId,
    durationMs,
    generateCount,
  });

  if (generateCount === 2) {
    logWorkflowEvent("second_story_created", { storyId, generateCount });
  }
}

export function logStorySaveClicked(storyId: string) {
  saveClickCount += 1;
  logWorkflowEvent("story_save_clicked", {
    storyId,
    saveClickCount,
  });
}

export function logStorySaveCompleted(storyId: string) {
  saveCompleteCount += 1;
  logWorkflowEvent("story_save_completed", {
    storyId,
    saveCompleteCount,
  });
}

export function logStoryPageView(storyId: string, status: string) {
  const seen = seenStoryIds();
  const isReopen = seen.has(storyId);

  logWorkflowEvent(isReopen ? "story_reopened" : "story_page_opened", {
    storyId,
    status,
  });

  rememberStoryId(storyId);
}
