import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { SaveButton } from "@/components/story/SaveButton";
import { StoryActionButtons } from "@/components/story/StoryActionButtons";
import { StoryEditorShell } from "@/components/story/StoryEditorShell";
import { StoryPagesSection } from "@/components/story/StoryPagesSection";
import { StoryPlanSummary } from "@/components/story/StoryPlanSummary";
import { VocabularyList } from "@/components/story/VocabularyList";
import { PilotWorkflowStoryView } from "@/components/validation/PilotWorkflowStoryView";
import { loadCharacterProfiles } from "@/lib/character-profiles";
import { createClient } from "@/lib/supabase/server";
import { resolveWeeklyPlan } from "@/lib/story/weekly-plan";

type StoryPageProps = {
  params: Promise<{ id: string }>;
};

function NotFoundState() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Story not found</h1>
      <p className="mt-2 text-sm text-gray-600">
        This story does not exist or you do not have access to it.
      </p>
      <Link
        href="/stories"
        className="mt-6 inline-block text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to home
      </Link>
    </main>
  );
}

export default async function StoryDetailPage({ params }: StoryPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: story, error: storyError } = await supabase
    .from("stories")
    .select(
      "id, title, theme, status, saved_at, learning_goal, vocabulary_focus, weekly_plan, main_events, character_hints, setting, tone, words_to_avoid, notes"
    )
    .eq("id", id)
    .eq("is_archived", false)
    .single();

  if (storyError || !story) {
    return <NotFoundState />;
  }

  const { data: pages } = await supabase
    .from("story_pages")
    .select("id, page_number, text, illustration_prompt")
    .eq("story_id", id)
    .order("page_number", { ascending: true });

  const { data: vocabulary } = await supabase
    .from("story_vocabulary")
    .select("word, definition_or_example, sort_order")
    .eq("story_id", id)
    .order("sort_order", { ascending: true });

  const { profiles } = await loadCharacterProfiles(supabase);

  const savedDate = story.saved_at
    ? new Date(story.saved_at).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : null;

  const statusLabel = story.status === "saved" ? "Saved" : "Draft";
  const weeklyPlan = resolveWeeklyPlan(story);

  const setup = {
    theme: story.theme,
    learning_goal: story.learning_goal,
    vocabulary_focus: story.vocabulary_focus,
    weekly_plan: story.weekly_plan,
    main_events: story.main_events,
    character_hints: story.character_hints,
    setting: story.setting,
    tone: story.tone,
    words_to_avoid: story.words_to_avoid,
    notes: story.notes,
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-5">
      <PilotWorkflowStoryView storyId={story.id} status={story.status} />
      <StoryEditorShell>
        <header className="mb-10 flex flex-col items-start justify-between gap-2">
          <div className="flex w-full flex-row items-center justify-between gap-5">
            <Link href="/stories" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to home
            </Link>
            <div className="mb-3 mt-3 flex flex-wrap items-center gap-2">
              <Link
                href="/stories/new"
                className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                New Story
              </Link>
              <SignOutButton />
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-1">
            <h1 className="mt-4 text-xl font-semibold md:text-2xl">{story.title}</h1>
            <p className="mt-1 text-sm text-gray-600">{story.theme}</p>
            <div className="mb-3 flex w-full flex-row items-center justify-between gap-2">
              <StoryActionButtons storyId={story.id} setup={setup} />
              <SaveButton storyId={story.id} />
            </div>
          </div>
          <div className="flex flex-row items-start gap-2">
            <div className="mb-3 mt-3 flex flex-wrap items-center justify-end gap-2">
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${story.status === "saved"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                  }`}
              >
                {statusLabel}
              </span>
              {savedDate && (
                <span className="text-xs text-gray-500">Saved {savedDate}</span>
              )}
            </div>
          </div>
        </header>

        <StoryPlanSummary topic={story.theme} weeklyPlan={weeklyPlan} />

        <StoryPagesSection
          storyId={story.id}
          storyTitle={story.title}
          storySetting={story.setting}
          pages={pages ?? []}
          profiles={profiles}
        />
      </StoryEditorShell>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Vocabulary</h2>
        <VocabularyList items={vocabulary ?? []} />
      </section>
    </main>
  );
}
