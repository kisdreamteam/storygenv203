import type { StorySetupFormState } from "./setup-form-state";
import { weeklyPlanFromForm } from "./setup-form-state";
import {
  emptyWeeklyPlan,
  isCompleteWeeklyPlan,
  WEEK_PLAN_KEYS,
  type WeeklyPlan,
  type WeeklyPlanKey,
} from "./weekly-plan";

export type StoryPathStep = "setup" | "week1" | "week2" | "week3" | "week4" | "review";

export type WeekPathState = {
  aiSuggestedOptions: string[];
  selectedOptions: string[];
  manualOption: string;
  finalApprovedWeekPlan: string;
};

export type StoryPathPlanningState = {
  step: StoryPathStep;
  weeks: Record<WeeklyPlanKey, WeekPathState>;
};

export const STORY_PATH_STEPS: StoryPathStep[] = [
  "setup",
  "week1",
  "week2",
  "week3",
  "week4",
  "review",
];

export const WEEK_STEP_TO_KEY: Record<"week1" | "week2" | "week3" | "week4", WeeklyPlanKey> = {
  week1: "week1",
  week2: "week2",
  week3: "week3",
  week4: "week4",
};

export const WEEK_KEY_TO_STEP: Record<WeeklyPlanKey, "week1" | "week2" | "week3" | "week4"> = {
  week1: "week1",
  week2: "week2",
  week3: "week3",
  week4: "week4",
};

export const WEEK_PAGE_RANGES: Record<WeeklyPlanKey, string> = {
  week1: "1–3",
  week2: "4–6",
  week3: "7–9",
  week4: "10–12",
};

export const WEEK_NUMBERS: Record<WeeklyPlanKey, number> = {
  week1: 1,
  week2: 2,
  week3: 3,
  week4: 4,
};

export function emptyWeekPathState(): WeekPathState {
  return {
    aiSuggestedOptions: [],
    selectedOptions: [],
    manualOption: "",
    finalApprovedWeekPlan: "",
  };
}

export function emptyStoryPathPlanningState(): StoryPathPlanningState {
  return {
    step: "setup",
    weeks: {
      week1: emptyWeekPathState(),
      week2: emptyWeekPathState(),
      week3: emptyWeekPathState(),
      week4: emptyWeekPathState(),
    },
  };
}

export function composeFinalWeekPlan(week: WeekPathState): string {
  const parts = [...week.selectedOptions];
  const manual = week.manualOption.trim();
  if (manual) parts.push(manual);
  return parts.join(" ").trim();
}

export function canContinueWeek(week: WeekPathState): boolean {
  return week.selectedOptions.length > 0 || week.manualOption.trim() !== "";
}

export function stepAfterWeek(weekKey: WeeklyPlanKey): StoryPathStep {
  const index = WEEK_PLAN_KEYS.indexOf(weekKey);
  if (index < 0 || index >= WEEK_PLAN_KEYS.length - 1) return "review";
  return WEEK_KEY_TO_STEP[WEEK_PLAN_KEYS[index + 1]];
}

export function stepBeforeWeek(weekKey: WeeklyPlanKey): StoryPathStep {
  const index = WEEK_PLAN_KEYS.indexOf(weekKey);
  if (index <= 0) return "setup";
  return WEEK_KEY_TO_STEP[WEEK_PLAN_KEYS[index - 1]];
}

export function isWeekStep(step: StoryPathStep): step is "week1" | "week2" | "week3" | "week4" {
  return step === "week1" || step === "week2" || step === "week3" || step === "week4";
}

export function weekKeyFromStep(step: "week1" | "week2" | "week3" | "week4"): WeeklyPlanKey {
  return WEEK_STEP_TO_KEY[step];
}

export function priorWeeksFromPathState(
  pathState: StoryPathPlanningState,
  currentWeekKey: WeeklyPlanKey
): Partial<WeeklyPlan> {
  const prior: Partial<WeeklyPlan> = {};
  const currentIndex = WEEK_PLAN_KEYS.indexOf(currentWeekKey);
  for (let i = 0; i < currentIndex; i++) {
    const key = WEEK_PLAN_KEYS[i];
    const approved = pathState.weeks[key].finalApprovedWeekPlan.trim();
    if (approved) {
      prior[key] = { events: approved, vocabulary: "" };
    }
  }
  return prior;
}

export function pathStateFromForm(form: StorySetupFormState): StoryPathPlanningState {
  const plan = weeklyPlanFromForm(form);
  const weeks = emptyStoryPathPlanningState().weeks;

  for (const key of WEEK_PLAN_KEYS) {
    const events = plan[key].events.trim();
    if (events) {
      weeks[key] = {
        ...emptyWeekPathState(),
        finalApprovedWeekPlan: events,
      };
    }
  }

  const step = isCompleteWeeklyPlan(plan) ? "review" : "setup";

  return { step, weeks };
}

export function syncFormWeekEventsFromPath(
  form: StorySetupFormState,
  pathState: StoryPathPlanningState
): StorySetupFormState {
  return {
    ...form,
    week1_events: pathState.weeks.week1.finalApprovedWeekPlan,
    week2_events: pathState.weeks.week2.finalApprovedWeekPlan,
    week3_events: pathState.weeks.week3.finalApprovedWeekPlan,
    week4_events: pathState.weeks.week4.finalApprovedWeekPlan,
  };
}

export function firstIncompleteWeekStep(form: StorySetupFormState): StoryPathStep {
  const plan = weeklyPlanFromForm(form);
  for (const key of WEEK_PLAN_KEYS) {
    if (!plan[key].events.trim()) {
      return WEEK_KEY_TO_STEP[key];
    }
  }
  return "review";
}

export function priorWeeksFromForm(
  form: StorySetupFormState,
  currentWeekKey: WeeklyPlanKey
): Partial<WeeklyPlan> {
  const plan = weeklyPlanFromForm(form);
  const prior: Partial<WeeklyPlan> = {};
  const currentIndex = WEEK_PLAN_KEYS.indexOf(currentWeekKey);
  for (let i = 0; i < currentIndex; i++) {
    const key = WEEK_PLAN_KEYS[i];
    const events = plan[key].events.trim();
    if (events) {
      prior[key] = { events, vocabulary: plan[key].vocabulary };
    }
  }
  return prior;
}

export function emptyPriorWeeks(): WeeklyPlan {
  return emptyWeeklyPlan();
}
