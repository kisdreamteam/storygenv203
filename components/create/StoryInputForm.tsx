"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StorySetupFields } from "@/components/story/StorySetupFields";
import { WeeklyPlanAssistBanner } from "@/components/story/WeeklyPlanAssistBanner";
import {
  emptyStorySetupForm,
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
import {
  logStoryCreatePageOpened,
  logStoryGenerateClicked,
  logStoryGenerateCompleted,
} from "@/lib/validation/workflow-log";

function countEmptyWeekEvents(form: StorySetupFormState): number {
  const plan = weeklyPlanFromForm(form);
  return WEEK_PLAN_KEYS.filter((key) => plan[key].events.trim() === "").length;
}

export function StoryInputForm() {
  const router = useRouter();
  const generateStartedAt = useRef<number | null>(null);
  const [form, setForm] = useState<StorySetupFormState>(emptyStorySetupForm);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [planSuggested, setPlanSuggested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const plan = weeklyPlanFromForm(form);
  const needsSuggestion = needsWeeklyPlanSuggestion(plan);
  const canGenerate = isStorySetupFormValid(form) && isCompleteWeeklyPlan(plan) && !loading;
  const canSuggest = isStorySetupFormValid(form) && !loading && !suggesting;
  const emptyWeekCount = countEmptyWeekEvents(form);

  useEffect(() => {
    logStoryCreatePageOpened();
  }, []);

  function updateField(field: keyof StorySetupFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setPlanError(null);
    setWarning(null);
  }

  async function handleSuggestPlan() {
    if (!canSuggest) return;

    setSuggesting(true);
    setPlanError(null);
    setError(null);

    try {
      const response = await fetch("/api/stories/suggest-weekly-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storySetupFormToPayload(form)),
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canGenerate) return;

    setLoading(true);
    setError(null);
    setPlanError(null);
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
        disabled={loading || suggesting}
        showMoreOptions={showMoreOptions}
        onToggleMoreOptions={() => setShowMoreOptions((open) => !open)}
        planAssistBanner={
          <WeeklyPlanAssistBanner
            needsSuggestion={needsSuggestion}
            planSuggested={planSuggested}
            suggesting={suggesting}
            canSuggest={canSuggest}
            onSuggest={handleSuggestPlan}
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
