"use client";

type WeeklyPlanAssistBannerProps = {
  needsSuggestion: boolean;
  planSuggested: boolean;
  planComplete: boolean;
  suggesting: boolean;
  canSuggest: boolean;
  onSuggest: () => void;
  emptyWeekCount: number;
  /** When true, banner always renders (edit setup modal). */
  alwaysShow?: boolean;
};

export function WeeklyPlanAssistBanner({
  needsSuggestion,
  planSuggested,
  planComplete,
  suggesting,
  canSuggest,
  onSuggest,
  emptyWeekCount,
  alwaysShow = false,
}: WeeklyPlanAssistBannerProps) {
  if (!alwaysShow && !needsSuggestion && !planSuggested) {
    return null;
  }

  const statusMessage = planComplete
    ? planSuggested
      ? "Not happy with the suggestion? Re-suggest to replace all weeks, or edit fields manually."
      : "All four weekly guidance fields are complete. Re-suggest to replace all weeks, or edit manually."
    : planSuggested
      ? emptyWeekCount === 4
        ? "Review all four weekly guidance fields below. Edit anything, then continue."
        : "Review the suggested weeks below. Edit anything, then continue."
      : "Fill in weekly guidance manually, or use AI to suggest the remaining weeks.";

  const buttonLabel = suggesting
    ? "Suggesting…"
    : planComplete
      ? "Re-suggest weekly plan"
      : planSuggested
        ? "Re-suggest remaining weeks"
        : "Suggest weekly plan";

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <p className="text-sm text-blue-900">{statusMessage}</p>
      <button
        type="button"
        onClick={onSuggest}
        disabled={!canSuggest || suggesting}
        className="mt-3 rounded bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
