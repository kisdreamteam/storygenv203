"use client";

import type { ReactNode } from "react";
import {
  isWeekStep,
  weekKeyFromStep,
  type StoryPathPlanningState,
} from "@/lib/story/story-path-planning";
import type { StorySetupFormState } from "@/lib/story/setup-form-state";
import type { WeeklyPlanKey } from "@/lib/story/weekly-plan";
import { StoryPathReview } from "./StoryPathReview";
import { StoryPathWeekPanel } from "./StoryPathWeekPanel";

type StoryPathWizardProps = {
  pathState: StoryPathPlanningState;
  form: StorySetupFormState;
  fetchingWeek: boolean;
  disabled?: boolean;
  onToggleOption: (weekKey: WeeklyPlanKey, option: string) => void;
  onManualOptionChange: (weekKey: WeeklyPlanKey, value: string) => void;
  onRefreshOptions: (weekKey: WeeklyPlanKey) => void;
  onBackFromWeek: (weekKey: WeeklyPlanKey) => void;
  onContinueFromWeek: (weekKey: WeeklyPlanKey) => void;
  onEditWeekFromReview: (weekKey: WeeklyPlanKey) => void;
  onReviewWeekPlanChange: (weekKey: WeeklyPlanKey, value: string) => void;
  onReviewVocabularyChange: (
    field: "week1_vocabulary" | "week2_vocabulary" | "week3_vocabulary" | "week4_vocabulary",
    value: string
  ) => void;
  onBackFromReview: () => void;
  reviewActions?: ReactNode;
};

export function StoryPathWizard({
  pathState,
  form,
  fetchingWeek,
  disabled = false,
  onToggleOption,
  onManualOptionChange,
  onRefreshOptions,
  onBackFromWeek,
  onContinueFromWeek,
  onEditWeekFromReview,
  onReviewWeekPlanChange,
  onReviewVocabularyChange,
  onBackFromReview,
  reviewActions,
}: StoryPathWizardProps) {
  if (isWeekStep(pathState.step)) {
    const weekKey = weekKeyFromStep(pathState.step);
    const week = pathState.weeks[weekKey];

    return (
      <StoryPathWeekPanel
        weekKey={weekKey}
        week={week}
        fetching={fetchingWeek}
        disabled={disabled}
        onToggleOption={(option) => onToggleOption(weekKey, option)}
        onManualOptionChange={(value) => onManualOptionChange(weekKey, value)}
        onRefreshOptions={() => onRefreshOptions(weekKey)}
        onBack={() => onBackFromWeek(weekKey)}
        onContinue={() => onContinueFromWeek(weekKey)}
      />
    );
  }

  if (pathState.step === "review") {
    return (
      <StoryPathReview
        pathState={pathState}
        vocabulary={{
          week1_vocabulary: form.week1_vocabulary,
          week2_vocabulary: form.week2_vocabulary,
          week3_vocabulary: form.week3_vocabulary,
          week4_vocabulary: form.week4_vocabulary,
        }}
        disabled={disabled}
        onEditWeek={onEditWeekFromReview}
        onWeekPlanChange={onReviewWeekPlanChange}
        onVocabularyChange={onReviewVocabularyChange}
        onBack={onBackFromReview}
        actions={reviewActions}
      />
    );
  }

  return null;
}
