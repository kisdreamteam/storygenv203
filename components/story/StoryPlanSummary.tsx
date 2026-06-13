import type { WeeklyPlan } from "@/lib/story/weekly-plan";
import { formatWeeklyPlanSummary, WEEK_PLAN_KEYS } from "@/lib/story/weekly-plan";

type StoryPlanSummaryProps = {
  topic: string;
  weeklyPlan: WeeklyPlan;
};

const PAGE_RANGES = ["Pages 1–3", "Pages 4–6", "Pages 7–9", "Pages 10–12"];

export function StoryPlanSummary({ topic, weeklyPlan }: StoryPlanSummaryProps) {
  const hasAnyWeek = WEEK_PLAN_KEYS.some(
    (key) => weeklyPlan[key].events.trim() || weeklyPlan[key].vocabulary.trim()
  );

  if (!topic.trim() && !hasAnyWeek) {
    return null;
  }

  return (
    <section className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">Story Plan</h2>
      <dl className="flex flex-col gap-3 text-sm text-gray-700">
        {topic.trim() && (
          <div>
            <dt className="font-medium text-gray-900">Topic</dt>
            <dd className="mt-0.5">{topic.trim()}</dd>
          </div>
        )}
        {WEEK_PLAN_KEYS.map((key, index) => {
          const week = weeklyPlan[key];
          const events = week.events.trim();
          const vocabulary = week.vocabulary.trim();
          if (!events && !vocabulary) return null;

          return (
            <div key={key}>
              <dt className="font-medium text-gray-900">
                Week {index + 1} ({PAGE_RANGES[index]})
              </dt>
              {events && <dd className="mt-0.5">{events}</dd>}
              {vocabulary && (
                <dd className="mt-1 text-gray-600">
                  <span className="font-medium text-gray-800">Vocabulary:</span> {vocabulary}
                </dd>
              )}
            </div>
          );
        })}
      </dl>
      <p className="sr-only">{formatWeeklyPlanSummary(weeklyPlan, topic)}</p>
    </section>
  );
}
