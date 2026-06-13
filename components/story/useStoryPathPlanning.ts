"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { characterHintsFromForm } from "@/lib/story/character-hints";
import {
  storySetupFormToPayload,
  type StorySetupFormState,
} from "@/lib/story/setup-form-state";
import {
  canContinueWeek,
  composeFinalWeekPlan,
  emptyStoryPathPlanningState,
  isWeekStep,
  pathStateFromForm,
  priorWeeksFromPathState,
  stepAfterWeek,
  stepBeforeWeek,
  syncFormWeekEventsFromPath,
  weekKeyFromStep,
  WEEK_KEY_TO_STEP,
  WEEK_NUMBERS,
  type StoryPathPlanningState,
  type StoryPathStep,
  type WeekPathState,
} from "@/lib/story/story-path-planning";
import type { WeeklyPlanKey } from "@/lib/story/weekly-plan";

type UseStoryPathPlanningOptions = {
  form: StorySetupFormState;
  setForm: React.Dispatch<React.SetStateAction<StorySetupFormState>>;
  disabled?: boolean;
  initialStep?: StoryPathStep;
};

export function useStoryPathPlanning({
  form,
  setForm,
  disabled = false,
  initialStep,
}: UseStoryPathPlanningOptions) {
  const [pathState, setPathState] = useState<StoryPathPlanningState>(() => {
    const fromForm = pathStateFromForm(form);
    if (initialStep) {
      return { ...fromForm, step: initialStep };
    }
    return fromForm;
  });
  const [fetchingWeek, setFetchingWeek] = useState(false);
  const [pathError, setPathError] = useState<string | null>(null);
  const pathStateRef = useRef(pathState);
  const formRef = useRef(form);

  pathStateRef.current = pathState;
  formRef.current = form;

  const clearPathError = useCallback(() => setPathError(null), []);

  const updateWeek = useCallback(
    (weekKey: WeeklyPlanKey, patch: Partial<WeekPathState>) => {
      setPathState((prev) => ({
        ...prev,
        weeks: {
          ...prev.weeks,
          [weekKey]: { ...prev.weeks[weekKey], ...patch },
        },
      }));
      setPathError(null);
    },
    []
  );

  const fetchWeekOptions = useCallback(
    async (weekKey: WeeklyPlanKey, resetSelections = false) => {
      if (disabled || fetchingWeek) return;

      setFetchingWeek(true);
      setPathError(null);

      try {
        const currentPath = pathStateRef.current;
        const currentForm = formRef.current;
        const weekNumber = WEEK_NUMBERS[weekKey];
        const payload = storySetupFormToPayload(currentForm);
        const priorWeeks = priorWeeksFromPathState(currentPath, weekKey);

        const response = await fetch("/api/stories/suggest-week-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            theme: payload.theme,
            learning_goal: payload.learning_goal,
            characterHints: characterHintsFromForm(
              currentForm.selected_characters,
              currentForm.other_characters
            ),
            week: weekNumber,
            priorWeeks,
            setting: payload.setting,
            tone: payload.tone,
            notes: payload.notes,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setPathError(data.error ?? "Could not load week options. Please try again.");
          return;
        }

        if (Array.isArray(data.options)) {
          setPathState((prev) => ({
            ...prev,
            weeks: {
              ...prev.weeks,
              [weekKey]: {
                ...prev.weeks[weekKey],
                aiSuggestedOptions: data.options,
                selectedOptions: resetSelections ? [] : prev.weeks[weekKey].selectedOptions,
                manualOption: resetSelections ? "" : prev.weeks[weekKey].manualOption,
              },
            },
          }));
        }
      } catch {
        setPathError("Could not load week options. Please try again.");
      } finally {
        setFetchingWeek(false);
      }
    },
    [disabled, fetchingWeek]
  );

  useEffect(() => {
    if (!isWeekStep(pathState.step)) return;
    const weekKey = weekKeyFromStep(pathState.step);
    const week = pathState.weeks[weekKey];
    if (week.aiSuggestedOptions.length > 0) return;
    void fetchWeekOptions(weekKey);
  }, [pathState.step, pathState.weeks, fetchWeekOptions]);

  function goToStep(step: StoryPathStep) {
    setPathState((prev) => ({ ...prev, step }));
    setPathError(null);
  }

  function startPathPlanning() {
    goToStep("week1");
  }

  function toggleOption(weekKey: WeeklyPlanKey, option: string) {
    const week = pathState.weeks[weekKey];
    const selected = week.selectedOptions.includes(option)
      ? week.selectedOptions.filter((item) => item !== option)
      : [...week.selectedOptions, option];
    updateWeek(weekKey, { selectedOptions: selected });
  }

  function setManualOption(weekKey: WeeklyPlanKey, value: string) {
    updateWeek(weekKey, { manualOption: value });
  }

  function continueFromWeek(weekKey: WeeklyPlanKey) {
    const week = pathState.weeks[weekKey];
    if (!canContinueWeek(week)) return;

    const finalApprovedWeekPlan = composeFinalWeekPlan(week);
    const nextStep = stepAfterWeek(weekKey);

    const nextPathState: StoryPathPlanningState = {
      ...pathState,
      step: nextStep,
      weeks: {
        ...pathState.weeks,
        [weekKey]: { ...pathState.weeks[weekKey], finalApprovedWeekPlan },
      },
    };

    setPathState(nextPathState);

    if (nextStep === "review") {
      setForm((prev) => syncFormWeekEventsFromPath(prev, nextPathState));
    }
  }

  function backFromWeek(weekKey: WeeklyPlanKey) {
    goToStep(stepBeforeWeek(weekKey));
  }

  function refreshWeekOptions(weekKey: WeeklyPlanKey) {
    updateWeek(weekKey, {
      aiSuggestedOptions: [],
      selectedOptions: [],
      manualOption: "",
    });
    void fetchWeekOptions(weekKey, true);
  }

  function editWeekFromReview(weekKey: WeeklyPlanKey) {
    goToStep(WEEK_KEY_TO_STEP[weekKey]);
  }

  function updateReviewWeekPlan(weekKey: WeeklyPlanKey, value: string) {
    updateWeek(weekKey, { finalApprovedWeekPlan: value });
    const field =
      weekKey === "week1"
        ? "week1_events"
        : weekKey === "week2"
          ? "week2_events"
          : weekKey === "week3"
            ? "week3_events"
            : "week4_events";
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateReviewVocabulary(
    field: "week1_vocabulary" | "week2_vocabulary" | "week3_vocabulary" | "week4_vocabulary",
    value: string
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function commitReviewToForm() {
    setForm((prev) => syncFormWeekEventsFromPath(prev, pathState));
  }

  function resetPathPlanning() {
    setPathState(emptyStoryPathPlanningState());
    setPathError(null);
  }

  return {
    pathState,
    fetchingWeek,
    pathError,
    clearPathError,
    startPathPlanning,
    goToStep,
    toggleOption,
    setManualOption,
    continueFromWeek,
    backFromWeek,
    refreshWeekOptions,
    editWeekFromReview,
    updateReviewWeekPlan,
    updateReviewVocabulary,
    commitReviewToForm,
    resetPathPlanning,
  };
}
