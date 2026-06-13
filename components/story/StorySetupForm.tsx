"use client";

import { useMemo, useState } from "react";
import type { OfficialCharacterKey } from "@/lib/character-profiles";
import type { CharacterHints } from "@/lib/story/character-hints";
import { toggleCharacterSelection } from "@/lib/story/character-hints";
import {
  isStorySetupFormValid,
  storySetupFormToPayload,
  storySetupFromStory,
  weeklyPlanFromForm,
  type StorySetupFormState,
} from "@/lib/story/setup-form-state";
import {
  firstIncompleteWeekStep,
  pathStateFromForm,
} from "@/lib/story/story-path-planning";
import { isCompleteWeeklyPlan, WEEK_PLAN_KEYS } from "@/lib/story/weekly-plan";
import { StoryPathWizard } from "./StoryPathWizard";
import { StorySetupFields } from "./StorySetupFields";
import { useStoryPathPlanning } from "./useStoryPathPlanning";

export type StorySetupData = {
  theme: string;
  learning_goal: string;
  vocabulary_focus: string;
  weekly_plan?: unknown;
  main_events?: string | null;
  character_hints?: CharacterHints | null;
  setting: string | null;
  tone: string | null;
  words_to_avoid: string | null;
  notes: string | null;
};

type StorySetupFormProps = {
  storyId: string;
  initialSetup: StorySetupData;
  onSuccess?: () => void;
  onCancel?: () => void;
  idPrefix?: string;
};

export function StorySetupForm({
  storyId,
  initialSetup,
  onSuccess,
  onCancel,
  idPrefix = "edit-setup",
}: StorySetupFormProps) {
  const initialForm = useMemo(() => storySetupFromStory(initialSetup), [initialSetup]);
  const initialStep = useMemo(() => {
    const fromForm = pathStateFromForm(initialForm);
    if (fromForm.step === "review") return "review";
    const plan = weeklyPlanFromForm(initialForm);
    const hasAnyWeek = WEEK_PLAN_KEYS.some((key) => plan[key].events.trim() !== "");
    if (!hasAnyWeek) return "setup";
    return firstIncompleteWeekStep(initialForm);
  }, [initialForm]);

  const [form, setForm] = useState<StorySetupFormState>(initialForm);
  const [showMoreOptions, setShowMoreOptions] = useState(
    Boolean(
      initialSetup.setting ||
        initialSetup.tone ||
        initialSetup.words_to_avoid ||
        initialSetup.notes
    )
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
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
  } = useStoryPathPlanning({
    form,
    setForm,
    disabled: loading,
    initialStep,
  });

  const plan = weeklyPlanFromForm(form);
  const planComplete = isCompleteWeeklyPlan(plan);

  function updateField(field: keyof StorySetupFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    clearPathError();
  }

  function handleCharacterToggle(key: OfficialCharacterKey) {
    setForm((prev) => ({
      ...prev,
      selected_characters: toggleCharacterSelection(prev.selected_characters, key),
    }));
    setError(null);
    clearPathError();
  }

  function handleOtherCharactersChange(value: string) {
    setForm((prev) => ({ ...prev, other_characters: value }));
    setError(null);
    clearPathError();
  }

  function openStoryPath() {
    if (planComplete) {
      goToStep("review");
    } else {
      startPathPlanning();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isStorySetupFormValid(form)) return;

    commitReviewToForm();

    setLoading(true);
    setError(null);
    clearPathError();

    try {
      const response = await fetch(`/api/stories/${storyId}/setup`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storySetupFormToPayload(form)),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to save setup.");
        return;
      }

      onSuccess?.();
    } catch {
      setError("Failed to save setup.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    isStorySetupFormValid(form) &&
    planComplete &&
    !loading &&
    !fetchingWeek;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <StorySetupFields
        form={form}
        onFieldChange={updateField}
        onCharacterToggle={handleCharacterToggle}
        onOtherCharactersChange={handleOtherCharactersChange}
        disabled={loading || fetchingWeek}
        showMoreOptions={showMoreOptions}
        onToggleMoreOptions={() => setShowMoreOptions((open) => !open)}
        idPrefix={idPrefix}
        mode="basics"
      />

      {pathState.step === "setup" && (
        <button
          type="button"
          onClick={openStoryPath}
          disabled={!isStorySetupFormValid(form) || loading}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {planComplete ? "Review story path" : "Choose story path"}
        </button>
      )}

      {pathState.step !== "setup" && (
        <StoryPathWizard
          pathState={pathState}
          form={form}
          fetchingWeek={fetchingWeek}
          disabled={loading}
          onToggleOption={toggleOption}
          onManualOptionChange={setManualOption}
          onRefreshOptions={refreshWeekOptions}
          onBackFromWeek={backFromWeek}
          onContinueFromWeek={continueFromWeek}
          onEditWeekFromReview={editWeekFromReview}
          onReviewWeekPlanChange={updateReviewWeekPlan}
          onReviewVocabularyChange={updateReviewVocabulary}
          onBackFromReview={() => goToStep("week4")}
        />
      )}

      <p className="text-xs text-gray-500">
        Save setup to store topic, characters, and weekly plan. Click Regenerate to apply
        changes to story pages.
      </p>

      {!planComplete && pathState.step === "setup" && (
        <p className="text-xs text-amber-700">
          Complete all four weeks in Choose story path before saving setup.
        </p>
      )}

      {pathError && (
        <p className="rounded bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {pathError}
        </p>
      )}

      {error && (
        <p className="rounded bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save setup"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || fetchingWeek}
            className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
