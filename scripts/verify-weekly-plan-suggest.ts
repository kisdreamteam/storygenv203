/**
 * Verify weekly plan suggest merge and generate gate helpers.
 * Run: npm run verify:weekly-plan-suggest
 */
import { suggestWeeklyPlan } from "@/lib/generation/suggest-weekly-plan";
import { validateGenerateStoryInputs } from "@/lib/story/validate-inputs";
import { mergeWeeklyPlans, type WeeklyPlan } from "@/lib/story/weekly-plan";

type Check = { name: string; ok: boolean; detail: string };
const checks: Check[] = [];

function record(name: string, ok: boolean, detail = "") {
  checks.push({ name, ok, detail });
}

const teacherWeek1Only: WeeklyPlan = {
  week1: { events: "Arrive at farm and feed animals", vocabulary: "farm, cow" },
  week2: { events: "", vocabulary: "" },
  week3: { events: "", vocabulary: "" },
  week4: { events: "", vocabulary: "" },
};

const mockSuggested: WeeklyPlan = {
  week1: { events: "AI week 1 should not win", vocabulary: "" },
  week2: { events: "Tractor ride through fields", vocabulary: "tractor" },
  week3: { events: "Help a sheep stuck in a bush", vocabulary: "sheep" },
  week4: { events: "See baby animals on the farm", vocabulary: "lamb" },
};

const merged = mergeWeeklyPlans(teacherWeek1Only, mockSuggested);
record(
  "merge_preserves_teacher_week1",
  merged.week1.events === "Arrive at farm and feed animals",
  merged.week1.events
);
record(
  "merge_fills_empty_weeks",
  merged.week2.events === "Tractor ride through fields" &&
    merged.week4.events === "See baby animals on the farm",
  `week2=${merged.week2.events}`
);

record(
  "generate_rejects_incomplete_plan",
  "error" in
    validateGenerateStoryInputs({
      theme: "Farm",
      learning_goal: "Learn about animals",
      weeklyPlan: teacherWeek1Only,
    }),
  "incomplete plan rejected"
);

record(
  "generate_accepts_complete_plan",
  !(
    "error" in
    validateGenerateStoryInputs({
      theme: "Farm",
      learning_goal: "Learn about animals",
      weeklyPlan: merged,
    })
  ),
  "complete plan accepted"
);

async function runSuggestMock() {
  const result = await suggestWeeklyPlan({
    theme: "Farm",
    learning_goal: "Learn about farm animals",
    vocabulary_focus: "",
    weeklyPlan: teacherWeek1Only,
    main_events: "",
  });

  record(
    "mock_suggest_fills_plan",
    result.ok === true && result.weeklyPlan.week1.events === "Arrive at farm and feed animals",
    result.ok ? result.weeklyPlan.week2.events : "error"
  );
}

async function main() {
  await runSuggestMock();

  console.log(JSON.stringify({ checks }, null, 2));
  const failed = checks.filter((check) => !check.ok);
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
