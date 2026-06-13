"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StorySetupFields } from "@/components/story/StorySetupFields";
import { WeeklyPlanAssistBanner } from "@/components/story/WeeklyPlanAssistBanner";
import { useWeeklyPlanSuggestion } from "@/components/story/useWeeklyPlanSuggestion";
import {
  emptyStorySetupForm,
  isStorySetupFormValid,
  storySetupFormToPayload,
  weeklyPlanFromForm,
  type StorySetupFormState,
} from "@/lib/story/setup-form-state";
import type { OfficialCharacterKey } from "@/lib/character-profiles";
import {
  characterHintsFromForm,
  needsSingleProtagonistWarning,
  toggleCharacterSelection,
} from "@/lib/story/character-hints";
import { isCompleteWeeklyPlan } from "@/lib/story/weekly-plan";
import {
  logStoryCreatePageOpened,
  logStoryGenerateClicked,
  logStoryGenerateCompleted,
} from "@/lib/validation/workflow-log";

export function StoryInputForm() {
  const router = useRouter();
  const generateStartedAt = useRef<number | null>(null);
  const [form, setForm] = useState<StorySetupFormState>(emptyStorySetupForm);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const {
    suggesting,
    planSuggested,
    planError,
    handleSuggest,
    clearPlanError,
    deriveBannerState,
  } = useWeeklyPlanSuggestion(loading);

  const plan = weeklyPlanFromForm(form);
  const { needsSuggestion, planComplete, emptyWeekCount, canSuggest } =
    deriveBannerState(form);
  const canGenerate = isStorySetupFormValid(form) && isCompleteWeeklyPlan(plan) && !loading;

  useEffect(() => {
    logStoryCreatePageOpened();
  }, []);

  function updateField(field: keyof StorySetupFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    clearPlanError();
    setWarning(null);
  }

  function handleCharacterToggle(key: OfficialCharacterKey) {
    setForm((prev) => ({
      ...prev,
      selected_characters: toggleCharacterSelection(prev.selected_characters, key),
    }));
    setError(null);
    clearPlanError();
    setWarning(null);
  }

  function handleOtherCharactersChange(value: string) {
    setForm((prev) => ({ ...prev, other_characters: value }));
    setError(null);
    clearPlanError();
    setWarning(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canGenerate) return;

    const hints = characterHintsFromForm(form.selected_characters, form.other_characters);
    if (needsSingleProtagonistWarning(hints)) {
      const onlyName = hints.official.includes("nina") ? "Nina" : "Nino";
      const missingName = hints.official.includes("nina") ? "Nino" : "Nina";
      const confirmed = window.confirm(
        `Only ${onlyName} is selected — ${missingName} will not appear in this story. Continue anyway?`
      );
      if (!confirmed) return;
    }

    setLoading(true);
    setError(null);
    clearPlanError();
    setWarning(null);
    generateStartedAt.current = Date.now();
    logStoryGenerateClicked();

    try {
      const response = await fetch("/api/stories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storySetupFormToPayload(form)),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Generation failed. Please try again.");
        return;
      }

      if (data.warning) {
        setWarning(data.warning);
      }

      const durationMs =
        generateStartedAt.current !== null
          ? Date.now() - generateStartedAt.current
          : 0;
      logStoryGenerateCompleted(data.storyId, durationMs);

      router.push(`/stories/${data.storyId}`);
      router.refresh();
    } catch {
      setError("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-xl flex-col gap-5 rounded-md border border-gray-200 p-5"
    >
      <StorySetupFields
        form={form}
        onFieldChange={updateField}
        onCharacterToggle={handleCharacterToggle}
        onOtherCharactersChange={handleOtherCharactersChange}
        disabled={loading || suggesting}
        showMoreOptions={showMoreOptions}
        onToggleMoreOptions={() => setShowMoreOptions((open) => !open)}
        planAssistBanner={
          <WeeklyPlanAssistBanner
            needsSuggestion={needsSuggestion}
            planSuggested={planSuggested}
            planComplete={planComplete}
            suggesting={suggesting}
            canSuggest={canSuggest}
            onSuggest={() => handleSuggest(form, setForm)}
            emptyWeekCount={emptyWeekCount}
          />
        }
      />

      {!needsSuggestion && isCompleteWeeklyPlan(plan) && (
        <p className="text-xs text-gray-500">
          All four weekly guidance fields are complete. You can Generate the story.
        </p>
      )}

      {needsSuggestion && !planSuggested && (
        <p className="text-xs text-gray-500">
          Generate is disabled until all four weekly guidance fields are filled. Use Suggest
          weekly plan or fill them manually.
        </p>
      )}

      <p className="text-xs text-gray-500">
        Prototype note: story wording may still feel template-like while real AI
        generation is being prepared.
      </p>

      {planError && (
        <p className="rounded bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {planError}
        </p>
      )}

      {warning && (
        <p className="rounded bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
          {warning}
        </p>
      )}

      {error && (
        <p className="rounded bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={!canGenerate}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate"}
        </button>
        <Link href="/stories" className="text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </Link>
      </div>
    </form>
  );
}
