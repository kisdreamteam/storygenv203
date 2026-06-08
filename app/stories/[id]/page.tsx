import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { RegenerateButton } from "@/components/story/RegenerateButton";
import { SaveButton } from "@/components/story/SaveButton";
import { StoryPageList } from "@/components/story/StoryPageList";
import { VocabularyList } from "@/components/story/VocabularyList";
import { PilotWorkflowStoryView } from "@/components/validation/PilotWorkflowStoryView";
import { createClient } from "@/lib/supabase/server";

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
        href="/"
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
    .select("id, title, theme, status, saved_at")
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

  const savedDate = story.saved_at
    ? new Date(story.saved_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const statusLabel = story.status === "saved" ? "Saved" : "Draft";

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-8">
      <PilotWorkflowStoryView storyId={story.id} status={story.status} />
      <header className="mb-10 flex items-start justify-between gap-2">
        <div>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">{story.title}</h1>
          <p className="mt-1 text-sm text-gray-600">{story.theme}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                story.status === "saved"
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
          <div className="flex items-center gap-3 mb-3">
            <RegenerateButton storyId={story.id} />
          </div>
          <div className="flex items-center gap-3">
            <SaveButton storyId={story.id} />
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">

          <div className="flex items-center gap-3">
            <Link
              href="/stories/new"
              className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              New Story
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <p className="mb-6 text-xs text-gray-500">
        Prototype note: story wording may still feel template-like while real AI
        generation is being prepared.
      </p>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Story pages</h2>
        <StoryPageList storyId={story.id} pages={pages ?? []} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Vocabulary</h2>
        <VocabularyList items={vocabulary ?? []} />
      </section>
    </main>
  );
}
