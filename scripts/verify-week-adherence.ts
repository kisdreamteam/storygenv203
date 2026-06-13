/**
 * Topic-first production week validation verification.
 * Run: npm run verify:week-adherence
 */
import { buildSystemPrompt } from "@/lib/generation/prompts";
import { validateGenerationOutputWithWeeks } from "@/lib/generation/validate-output";
import {
  detectWeekLanguageInText,
  extractDistinctiveWeekKeywords,
  validateNoWeekLanguageInText,
  validateWeekAdherence,
  validateWeekAdherencePages,
  weeksFromWeeklyPlan,
} from "@/lib/generation/week-structure";
import type { StoryInputs } from "@/lib/generation/types";
import type { WeeklyPlan, WeeklyPlanWeek } from "@/lib/story/weekly-plan";
import { emptyWeeklyPlan } from "@/lib/story/weekly-plan";
import { getFactoryCharacterProfiles } from "@/lib/character-profiles";

type Check = { name: string; ok: boolean; detail: string };
const checks: Check[] = [];

function record(name: string, ok: boolean, detail = "") {
  checks.push({ name, ok, detail });
}

function makeWords(count: number, prefix: string): string {
  return Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`).join(" ");
}

function makePageText(extra: string, topic?: string): string {
  const topicPart = topic ? `${topic} ` : "";
  return `${topicPart}${extra}. Nina and Nino explore together with friends. They learn new words together each day. ${makeWords(10, "word")}.`;
}

function makeStoryPages(
  pageTexts: string[]
): Array<{ page_number: number; text: string; illustration_scene: string }> {
  return pageTexts.map((text, index) => ({
    page_number: index + 1,
    text,
    illustration_scene: makeWords(12, "scene"),
  }));
}

function makePayload(
  pageTexts: string[],
  topic?: string,
  inferred?: WeeklyPlan
) {
  return {
    story: { title: "Test Story" },
    pages: makeStoryPages(pageTexts.map((extra) => makePageText(extra, topic))),
    vocabulary: [{ word: "test", definition_or_example: "A test word.", sort_order: 1 }],
    ...(inferred ? { inferred_weekly_plan: inferred } : {}),
  };
}

function weekPlan(events: string, vocabulary = ""): WeeklyPlanWeek {
  return { events, vocabulary };
}

const FARM_PLAN: WeeklyPlan = {
  week1: weekPlan("arrive at farm, see the animals, feed the animals", "farm, cow, goat, feed"),
  week2: weekPlan("tractor ride, see the corn, sunflowers, and beans", "tractor, corn, sunflower, beans"),
  week3: weekPlan("find a sheep stuck in the bush, help the sheep", "sheep, stuck, bush, help"),
  week4: weekPlan("realize the sheep had a lamb, see other baby animals", "lamb, baby animals, ducklings, chicks"),
};

function farmInputs(weeklyPlan: WeeklyPlan = FARM_PLAN): StoryInputs {
  return {
    theme: "Farm",
    learning_goal: "Learn about farm animals",
    vocabulary_focus: "farm, tractor, sheep",
    weeklyPlan,
    main_events: "Week 1: test",
  };
}

function farmAlignedTexts(): string[] {
  return [
    "farm arrive barn cow goat feed hay",
    "farm cow goat feed buckets hungry",
    "farm feed goat cow grain trough nina",
    "farm tractor corn sunflowers beans",
    "farm tractor ride sunflower rows",
    "farm corn beans tractor fields",
    "farm sheep bush stuck baa",
    "farm sheep bush help farmer",
    "farm help sheep bush free",
    "farm lamb ducklings chicks baby animals",
    "farm pregnant sheep lamb newborn ducklings",
    "farm baby animals lamb chicks ducklings nino",
  ];
}

function validateProduction(payload: unknown, inputs: StoryInputs) {
  return validateGenerationOutputWithWeeks(payload, inputs);
}

// --- Production gate: aligned story passes ---

const farmGood = makePayload(farmAlignedTexts(), "farm");
record(
  "production_farm_aligned_passes",
  validateProduction(farmGood, farmInputs()).ok === true,
  "aligned farm story passes production validation"
);

// --- Production gate: week language fails ---

const farmSecondWeekLanguage = makePayload(farmAlignedTexts(), "farm");
farmSecondWeekLanguage.pages[3].text = makePageText(
  "In the second week Nina and Nino ride the farm tractor through corn rows and sunflower fields with the farmer",
  "farm"
);
record(
  "production_farm_week_language_fails",
  validateProduction(farmSecondWeekLanguage, farmInputs()).ok === false,
  (() => {
    const check = validateProduction(farmSecondWeekLanguage, farmInputs());
    return check.ok ? "unexpected pass" : check.reason ?? "";
  })()
);

const weekLanguageCheck = validateNoWeekLanguageInText(farmSecondWeekLanguage);
record(
  "validateNoWeekLanguageInText_fails",
  weekLanguageCheck.ok === false,
  weekLanguageCheck.ok ? "" : weekLanguageCheck.reason ?? ""
);

record(
  "detect_in_the_second_week",
  detectWeekLanguageInText("In the second week they rode the tractor") === "second week",
  detectWeekLanguageInText("In the second week they rode the tractor") ?? "no match"
);
record(
  "detect_on_the_third_week",
  detectWeekLanguageInText("On the third week they helped the sheep") === "third week",
  detectWeekLanguageInText("On the third week they helped the sheep") ?? "no match"
);

// --- Production gate: topic-only requires inferred plan ---

const topicOnlyInputs = farmInputs(emptyWeeklyPlan());
const topicOnlyPayload = makePayload(farmAlignedTexts(), "farm");
const topicOnlyCheck = validateProduction(topicOnlyPayload, topicOnlyInputs);
record(
  "production_topic_only_requires_inferred_plan",
  topicOnlyCheck.ok === false &&
    ("reason" in topicOnlyCheck ? topicOnlyCheck.reason.includes("inferred_weekly_plan") : false),
  topicOnlyCheck.ok ? "unexpected pass" : "reason" in topicOnlyCheck ? topicOnlyCheck.reason : ""
);

const topicOnlyWithInferred = makePayload(farmAlignedTexts(), "farm", FARM_PLAN);
record(
  "production_topic_only_with_inferred_passes",
  validateProduction(topicOnlyWithInferred, topicOnlyInputs).ok === true,
  "topic-only generation passes when inferred plan present"
);

// --- Keyword placement demoted (not production gate) ---

const farmFeedOnPage4 = makePayload(farmAlignedTexts(), "farm");
farmFeedOnPage4.pages[0].text = makePageText("farm arrive barn animals", "farm");
farmFeedOnPage4.pages[1].text = makePageText("farm animals look around barn", "farm");
farmFeedOnPage4.pages[2].text = makePageText("farm animals walk paths nina", "farm");
farmFeedOnPage4.pages[3].text = makePageText(
  "farm feed animals grain buckets trough hungry cows nino",
  "farm"
);
record(
  "production_farm_feed_on_page4_not_hard_failed",
  validateProduction(farmFeedOnPage4, farmInputs()).ok === true,
  "keyword placement drift is not a production hard fail"
);

const farmLambOnPage9 = makePayload(farmAlignedTexts(), "farm");
farmLambOnPage9.pages[8].text = makePageText(
  "farm lamb baby animals newborn sheep steps nina nino watch",
  "farm"
);
record(
  "production_farm_lamb_on_page9_not_hard_failed",
  validateProduction(farmLambOnPage9, farmInputs()).ok === true,
  "early week-4 concept placement is not a production hard fail"
);

// --- Module-level week adherence (optional diagnostics) ---

function validateWithPlan(payload: unknown, plan: WeeklyPlan, topic: string) {
  return validateWeekAdherence(payload, { weeklyPlan: plan, topic });
}

record(
  "module_farm_aligned_passes",
  validateWithPlan(farmGood, FARM_PLAN, "Farm").ok === true,
  "validateWeekAdherence still passes aligned farm story"
);

const farmWeek4Keywords = extractDistinctiveWeekKeywords(FARM_PLAN.week4.events, "Farm");
record(
  "farm_week4_distinctive_keywords",
  farmWeek4Keywords.some((k) => k.includes("lamb") || k === "lamb"),
  farmWeek4Keywords.join(", ")
);

const factory = getFactoryCharacterProfiles();
const systemPrompt = buildSystemPrompt(factory, farmInputs());
record(
  "system_prompt_topic_first",
  systemPrompt.includes("topic-first") &&
    systemPrompt.includes("NEVER write") &&
    systemPrompt.includes("week"),
  "topic-first and week-invisibility rules in system prompt"
);

const weeks = weeksFromWeeklyPlan(FARM_PLAN);
const pages = farmGood.pages.map((p) => ({ page_number: p.page_number, text: p.text }));
record(
  "validateWeekAdherencePages_export",
  validateWeekAdherencePages(pages, weeks, "Farm").ok === true,
  "direct page validation passes for aligned farm (module API)"
);

console.log(JSON.stringify({ checks }, null, 2));
const failed = checks.filter((check) => !check.ok);
process.exit(failed.length === 0 ? 0 : 1);
