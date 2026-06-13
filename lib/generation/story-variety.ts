import type { SeriesMemorySummary } from "./types";

export type StoryShapeId =
  | "discovery"
  | "helper"
  | "surprise"
  | "wonder"
  | "builder"
  | "challenge";

export type StoryShape = {
  id: StoryShapeId;
  label: string;
  week1: string;
  week2: string;
  week3: string;
  week4: string;
};

export const STORY_SHAPE_CATALOG: StoryShape[] = [
  {
    id: "discovery",
    label: "Discovery",
    week1: "introduce Topic, setting, and a curious question or clue to follow",
    week2: "explore the Topic and notice something unexpected worth investigating",
    week3: "follow the clue or find — discover something new tied to the Topic",
    week4: "share the discovery through action or a concrete moment (not a lecture)",
  },
  {
    id: "helper",
    label: "Helper",
    week1: "introduce Topic, setting, and a simple goal connected to the Topic",
    week2: "explore the Topic and meet someone or something that needs kind help",
    week3: "offer practical help using Topic learning — teamwork, not a generic obstacle",
    week4: "celebrate the help given with a specific action or image callback",
  },
  {
    id: "surprise",
    label: "Surprise",
    week1: "introduce Topic, setting, and a clear plan or expectation",
    week2: "explore the Topic until a twist, guest, or unexpected change appears",
    week3: "adapt to the surprise and learn something new about the Topic",
    week4: "resolve with a playful or warm moment rooted in the surprise",
  },
  {
    id: "wonder",
    label: "Wonder",
    week1: "introduce Topic, setting, and a why-or-how question",
    week2: "explore the Topic through observation, questions, and gentle testing",
    week3: "go deeper into curiosity — wonder and notice patterns (not a problem to fix)",
    week4: "answer or extend the wonder with a concrete scene, not a summary",
  },
  {
    id: "builder",
    label: "Builder",
    week1: "introduce Topic, setting, and something to make, build, or create",
    week2: "gather materials or ideas and start building within the Topic",
    week3: "improve, adjust, or finish the build with Topic learning woven in",
    week4: "use or share what was built in a meaningful closing scene",
  },
  {
    id: "challenge",
    label: "Challenge",
    week1: "introduce Topic, setting, and a goal tied to the learning focus",
    week2: "explore and practice within the Topic through hands-on activity",
    week3: "a small, Topic-specific obstacle — characters work together to solve it",
    week4: "meaningful resolution with new learning shown through action",
  },
];

export const STORY_ANTI_FORMULA_GUIDANCE = `
Anti-formula rules (strict — avoid the default Nina & Nino recipe):
- Do NOT default to: make a checklist → face a challenge → reflect on what they learned.
- Do NOT include checklist or "make a list" scenes; vocabulary belongs in action and dialogue, not recitation.
- Pages 7–9 must NOT always be a generic obstacle; use the assigned story shape unless teacher guidance says otherwise.
- Endings must show feeling through action, dialogue, or a concrete image — not a summary of lessons learned.
- Vary opening actions, middle activities, dialogue, and closing images across stories.
`.trim();

export const SUGGEST_VARIETY_GUIDANCE = `
Story shape variety (strict when proposing empty weeks):
- Propose varied weekly beats — do NOT reuse the same practice → challenge → reflect formula every time.
- Follow the assigned story shape below for empty weeks; challenge is one option, not the default.
- Avoid generic phrases like "practice and discover", "face a small challenge", or "warm closing moment" unless the shape requires it.
`.trim();

export const FIRST_GENERATE_VARIETY_GUIDANCE = `
First-generation variety (strict):
- Vary opening action, middle activity type, dialogue, and ending image.
- Do not copy a generic Nina & Nino template across stories.
- Follow the assigned story shape and anti-formula rules below.
`.trim();

/** Deterministic index from topic string — stable for the same Topic, varies across topics. */
export function storyShapeIndexFromTheme(theme: string): number {
  const normalized = theme.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return hash % STORY_SHAPE_CATALOG.length;
}

export function storyShapeForTheme(theme: string): StoryShape {
  return STORY_SHAPE_CATALOG[storyShapeIndexFromTheme(theme)];
}

export function formatStoryShapeHint(theme: string): string {
  const shape = storyShapeForTheme(theme);
  return `Preferred story shape for this plan: ${shape.label}
- Week 1 / Pages 1–3: ${shape.week1}
- Week 2 / Pages 4–6: ${shape.week2}
- Week 3 / Pages 7–9: ${shape.week3}
- Week 4 / Pages 10–12: ${shape.week4}`;
}

export function formatSeriesMemoryPlotAvoidance(memory: SeriesMemorySummary): string {
  const recent = memory.recent_stories.slice(-3);
  if (recent.length === 0) {
    return "No recent saved stories — choose a fresh scene sequence for this Topic.";
  }

  const summaries = recent
    .map((entry, index) => {
      const title = entry.title?.trim() || "(untitled)";
      const theme = entry.theme?.trim() || "(unknown topic)";
      const events = entry.key_events?.trim() || "(no summary)";
      return `${index + 1}. "${title}" (${theme}): ${events}`;
    })
    .join("\n");

  return `Plot avoidance (compare recent saved stories — use a clearly different scene sequence and middle-block activity type):
${summaries}
Do NOT repeat the same plot pattern (checklist → obstacle → reflection) as these recent stories. Each new story must still read standalone for students.`;
}
