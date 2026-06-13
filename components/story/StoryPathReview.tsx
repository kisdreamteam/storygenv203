"use client";

import type { ReactNode } from "react";
import {
  WEEK_NUMBERS,
  WEEK_PAGE_RANGES,
  type StoryPathPlanningState,
} from "@/lib/story/story-path-planning";
import { WEEK_PLAN_KEYS, type WeeklyPlanKey } from "@/lib/story/weekly-plan";

type StoryPathReviewProps = {
  pathState: StoryPathPlanningState;
  vocabulary: {
    week1_vocabulary: string;
    week2_vocabulary: string;
    week3_vocabulary: string;
    week4_vocabulary: string;
  };
  disabled?: boolean;
  onEditWeek: (weekKey: WeeklyPlanKey) => void;
  onWeekPlanChange: (weekKey: WeeklyPlanKey, value: string) => void;
  onVocabularyChange: (
    field: "week1_vocabulary" | "week2_vocabulary" | "week3_vocabulary" | "week4_vocabulary",
    value: string
  ) => void;
  onBack: () => void;
  actions?: ReactNode;
};

const inputClass =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-gray-700";

const VOCAB_FIELDS: Record<
  WeeklyPlanKey,
  "week1_vocabulary" | "week2_vocabulary" | "week3_vocabulary" | "week4_vocabulary"
> = {
  week1: "week1_vocabulary",
  week2: "week2_vocabulary",
  week3: "week3_vocabulary",
  week4: "week4_vocabulary",
};

export function StoryPathReview({
  pathState,
  vocabulary,
  disabled = false,
  onEditWeek,
  onWeekPlanChange,
  onVocabularyChange,
  onBack,
  actions,
}: StoryPathReviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Review your story path</h3>
        <p className="mt-1 text-xs text-gray-500">
          Your chosen paths guide generation. The story will expand these into full scenes—you
          can edit the wording here if needed.
        </p>
      </div>

      {WEEK_PLAN_KEYS.map((weekKey) => {
        const weekNumber = WEEK_NUMBERS[weekKey];
        const pageRange = WEEK_PAGE_RANGES[weekKey];
        const vocabField = VOCAB_FIELDS[weekKey];

        return (
          <div key={weekKey} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-gray-900">
                Week {weekNumber} (pages {pageRange})
              </h4>
              <button
                type="button"
                onClick={() => onEditWeek(weekKey)}
                disabled={disabled}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Edit
              </button>
            </div>

            <div>
              <label htmlFor={`review-${weekKey}-events`} className={labelClass}>
                Approved plan
              </label>
              <textarea
                id={`review-${weekKey}-events`}
                rows={2}
                value={pathState.weeks[weekKey].finalApprovedWeekPlan}
                onChange={(e) => onWeekPlanChange(weekKey, e.target.value)}
                className={inputClass}
                disabled={disabled}
              />
            </div>

            <div>
              <label htmlFor={`review-${weekKey}-vocab`} className={labelClass}>
                Vocabulary (optional)
              </label>
              <input
                id={`review-${weekKey}-vocab`}
                type="text"
                value={vocabulary[vocabField]}
                onChange={(e) => onVocabularyChange(vocabField, e.target.value)}
                placeholder="e.g. farm, cow, feed"
                className={inputClass}
                disabled={disabled}
              />
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={disabled}
          className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back to Week 4
        </button>
        {actions}
      </div>
    </div>
  );
}
