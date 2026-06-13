"use client";

import {
  canContinueWeek,
  WEEK_NUMBERS,
  WEEK_PAGE_RANGES,
  type WeekPathState,
} from "@/lib/story/story-path-planning";
import type { WeeklyPlanKey } from "@/lib/story/weekly-plan";

type StoryPathWeekPanelProps = {
  weekKey: WeeklyPlanKey;
  week: WeekPathState;
  fetching: boolean;
  disabled?: boolean;
  onToggleOption: (option: string) => void;
  onManualOptionChange: (value: string) => void;
  onRefreshOptions: () => void;
  onBack: () => void;
  onContinue: () => void;
};

const inputClass =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-gray-700";

export function StoryPathWeekPanel({
  weekKey,
  week,
  fetching,
  disabled = false,
  onToggleOption,
  onManualOptionChange,
  onRefreshOptions,
  onBack,
  onContinue,
}: StoryPathWeekPanelProps) {
  const weekNumber = WEEK_NUMBERS[weekKey];
  const pageRange = WEEK_PAGE_RANGES[weekKey];
  const canContinue = canContinueWeek(week);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          Week {weekNumber} (pages {pageRange})
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Pick one or more short path ideas for this week, or add your own. These are
          directions—not full scenes.
        </p>
      </div>

      {fetching && week.aiSuggestedOptions.length === 0 ? (
        <p className="text-sm text-gray-600">Loading ideas…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {week.aiSuggestedOptions.map((option) => {
            const selected = week.selectedOptions.includes(option);
            return (
              <label
                key={option}
                className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 text-sm transition-colors ${
                  selected
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggleOption(option)}
                  disabled={disabled}
                  className="mt-0.5"
                />
                <span className="text-gray-800">{option}</span>
              </label>
            );
          })}
        </div>
      )}

      <div>
        <label htmlFor={`manual-${weekKey}`} className={labelClass}>
          Add my own idea
        </label>
        <input
          id={`manual-${weekKey}`}
          type="text"
          value={week.manualOption}
          onChange={(e) => onManualOptionChange(e.target.value)}
          placeholder="Visit the animal room"
          className={inputClass}
          disabled={disabled}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={disabled}
          className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onRefreshOptions}
          disabled={disabled || fetching}
          className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {fetching ? "Loading…" : "Get new ideas"}
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={disabled || !canContinue}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {weekNumber < 4 ? `Continue to Week ${weekNumber + 1}` : "Continue to review"}
        </button>
      </div>

      {!canContinue && (
        <p className="text-xs text-gray-500">
          Select at least one idea or enter your own before continuing.
        </p>
      )}
    </div>
  );
}
