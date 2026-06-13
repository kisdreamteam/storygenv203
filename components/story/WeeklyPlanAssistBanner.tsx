"use client";

type WeeklyPlanAssistBannerProps = {
  needsSuggestion: boolean;
  planSuggested: boolean;
  suggesting: boolean;
  canSuggest: boolean;
  onSuggest: () => void;
  emptyWeekCount: number;
};

export function WeeklyPlanAssistBanner({
  needsSuggestion,
  planSuggested,
  suggesting,
  canSuggest,
  onSuggest,
  emptyWeekCount,
}: WeeklyPlanAssistBannerProps) {
  if (!needsSuggestion && !planSuggested) {
    return null;
  }

  const statusMessage = planSuggested
    ? emptyWeekCount === 4
      ? "Review all four weekly guidance fields below. Edit anything, then Generate."
      : "Review the suggested weeks below. Edit anything, then Generate."
    : "Fill in weekly guidance manually, or use AI to suggest the remaining weeks.";

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <p className="text-sm text-blue-900">{statusMessage}</p>
      {needsSuggestion && (
        <button
          type="button"
          onClick={onSuggest}
          disabled={!canSuggest || suggesting}
          className="mt-3 rounded bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {suggesting
            ? "Suggesting…"
            : planSuggested
              ? "Re-suggest remaining weeks"
              : "Suggest weekly plan"}
        </button>
      )}
    </div>
  );
}
