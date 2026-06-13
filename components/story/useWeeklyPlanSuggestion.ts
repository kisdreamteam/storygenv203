"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  formFromWeeklyPlan,
  isStorySetupFormValid,
  storySetupFormToPayload,
  weeklyPlanFromForm,
  type StorySetupFormState,
} from "@/lib/story/setup-form-state";
import {
  isCompleteWeeklyPlan,
  needsWeeklyPlanSuggestion,
  WEEK_PLAN_KEYS,
} from "@/lib/story/weekly-plan";

const REPLACE_ALL_CONFIRM =
  "Replace all four weekly guidance fields with a new suggestion?";

function countEmptyWeekEvents(form: StorySetupFormState): number {
  const plan = weeklyPlanFromForm(form);
  return WEEK_PLAN_KEYS.filter((key) => plan[key].events.trim() === "").length;
}

export function useWeeklyPlanSuggestion(disabled = false) {
  const [suggesting, setSuggesting] = useState(false);
  const [planSuggested, setPlanSuggested] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  function clearPlanError() {
    setPlanError(null);
  }

  async function handleSuggest(
    form: StorySetupFormState,
    setForm: Dispatch<SetStateAction<StorySetupFormState>>
  ) {
    const plan = weeklyPlanFromForm(form);
    const canSuggest = isStorySetupFormValid(form) && !disabled && !suggesting;
    if (!canSuggest) return;

    const needsReplaceAll = isCompleteWeeklyPlan(plan);
    if (needsReplaceAll) {
      const confirmed = window.confirm(REPLACE_ALL_CONFIRM);
      if (!confirmed) return;
    }

    setSuggesting(true);
    setPlanError(null);

    try {
      const response = await fetch("/api/stories/suggest-weekly-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...storySetupFormToPayload(form),
          replaceAll: needsReplaceAll,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPlanError(data.error ?? "Could not suggest weekly plan. Please try again.");
        return;
      }

      if (data.weeklyPlan) {
        setForm((prev) => ({
          ...prev,
          ...formFromWeeklyPlan(data.weeklyPlan),
        }));
        setPlanSuggested(true);
      }
    } catch {
      setPlanError("Could not suggest weekly plan. Please try again.");
    } finally {
      setSuggesting(false);
    }
  }

  function deriveBannerState(form: StorySetupFormState) {
    const plan = weeklyPlanFromForm(form);
    return {
      needsSuggestion: needsWeeklyPlanSuggestion(plan),
      planComplete: isCompleteWeeklyPlan(plan),
      emptyWeekCount: countEmptyWeekEvents(form),
      canSuggest: isStorySetupFormValid(form) && !disabled && !suggesting,
    };
  }

  return {
    suggesting,
    planSuggested,
    planError,
    handleSuggest,
    clearPlanError,
    deriveBannerState,
  };
}
