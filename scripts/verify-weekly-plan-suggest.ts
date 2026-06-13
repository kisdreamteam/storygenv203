/**
 * Verify weekly plan suggest merge and generate gate helpers.
 * Run: npm run verify:weekly-plan-suggest
 */
import {
  buildSuggestUserPrompt,
  suggestWeeklyPlan,
} from "@/lib/generation/suggest-weekly-plan";
import {
  formatStoryShapeHint,
  storyShapeForTheme,
  storyShapeIndexFromTheme,
} from "@/lib/generation/story-variety";
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

const emptyWeeklyPlan: WeeklyPlan = {
  week1: { events: "", vocabulary: "" },
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

const suggestPromptWithCharacters = buildSuggestUserPrompt({
  theme: "Farm",
  learning_goal: "Learn about animals",
  vocabulary_focus: "",
  weeklyPlan: emptyWeeklyPlan,
  main_events: "",
  characterHints: { official: ["nina", "nino", "mom", "grandpa"] },
});

record(
  "suggest_prompt_lists_characters_explicitly",
  suggestPromptWithCharacters.includes("Characters for this story") &&
    suggestPromptWithCharacters.includes("- Mom") &&
    suggestPromptWithCharacters.includes("- Grandpa"),
  "explicit character section present"
);

const suggestPromptVariety = buildSuggestUserPrompt({
  theme: "Farm",
  learning_goal: "Learn about animals",
  vocabulary_focus: "",
  weeklyPlan: emptyWeeklyPlan,
  main_events: "",
});

record(
  "suggest_prompt_includes_story_shape",
  suggestPromptVariety.includes("Preferred story shape"),
  "story shape block present"
);

record(
  "suggest_prompt_avoids_fixed_challenge_block",
  !suggestPromptVariety.includes(
    "Week 3 / Pages 7–9: small challenge or deeper learning"
  ),
  "fixed challenge-only week 3 block removed"
);

record(
  "story_shape_index_stable",
  storyShapeIndexFromTheme("Farm") === storyShapeIndexFromTheme("Farm"),
  "deterministic hash stable"
);

const farmShape = storyShapeForTheme("Farm");
const rotationTopics = ["Farm", "Ocean", "Space", "Weather", "Music", "Plants"];
const hasDistinctShape = rotationTopics.some(
  (topic) => storyShapeForTheme(topic).id !== farmShape.id
);
record(
  "story_shape_rotation_differs_by_topic",
  hasDistinctShape,
  `Farm shape=${farmShape.id}`
);

const farmHint = formatStoryShapeHint("Farm");
const distinctHint = rotationTopics.find(
  (topic) => formatStoryShapeHint(topic) !== farmHint
);
record(
  "story_shape_hint_differs_across_topics",
  distinctHint !== undefined,
  distinctHint ? `differs from ${distinctHint}` : "no differing topic found"
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

async function runSuggestWithCharacters() {
  const savedKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "";

  try {
    const result = await suggestWeeklyPlan({
      theme: "Farm",
      learning_goal: "Learn about farm animals",
      vocabulary_focus: "",
      weeklyPlan: emptyWeeklyPlan,
      main_events: "",
      characterHints: { official: ["nina", "nino", "mom", "grandpa"] },
    });

    if (!result.ok) {
      record("mock_suggest_names_characters", false, "suggest failed");
      return;
    }

    const laterWeeks = [
      result.weeklyPlan.week2.events,
      result.weeklyPlan.week3.events,
      result.weeklyPlan.week4.events,
    ].join(" ");

    record(
      "mock_suggest_names_characters",
      laterWeeks.includes("Mom") || laterWeeks.includes("Grandpa"),
      laterWeeks.slice(0, 120)
    );
  } finally {
    if (savedKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = savedKey;
    }
  }
}

async function runReplaceAllTests() {
  const savedKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "";

  const completePlan: WeeklyPlan = {
    week1: { events: "Teacher week 1 beat", vocabulary: "a, b" },
    week2: { events: "Teacher week 2 beat", vocabulary: "c" },
    week3: { events: "Teacher week 3 beat", vocabulary: "d" },
    week4: { events: "Teacher week 4 beat", vocabulary: "e" },
  };

  const inputs = {
    theme: "Farm",
    learning_goal: "Learn about farm animals",
    vocabulary_focus: "",
    weeklyPlan: completePlan,
    main_events: "",
  };

  try {
    const unchanged = await suggestWeeklyPlan(inputs);
    record(
      "complete_plan_without_replace_all_unchanged",
      unchanged.ok === true &&
        unchanged.weeklyPlan.week1.events === "Teacher week 1 beat",
      unchanged.ok ? unchanged.weeklyPlan.week1.events : "error"
    );

    const replaced = await suggestWeeklyPlan(inputs, { replaceAll: true });
    record(
      "complete_plan_replace_all_gets_new_mock",
      replaced.ok === true &&
        replaced.weeklyPlan.week1.events !== "Teacher week 1 beat" &&
        replaced.weeklyPlan.week2.events.trim() !== "" &&
        replaced.weeklyPlan.week3.events.trim() !== "" &&
        replaced.weeklyPlan.week4.events.trim() !== "",
      replaced.ok ? replaced.weeklyPlan.week1.events.slice(0, 80) : "error"
    );
  } finally {
    if (savedKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = savedKey;
    }
  }
}

async function main() {
  await runSuggestMock();
  await runSuggestWithCharacters();
  await runReplaceAllTests();

  console.log(JSON.stringify({ checks }, null, 2));
  const failed = checks.filter((check) => !check.ok);
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
