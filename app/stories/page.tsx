import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { EditCharactersButton } from "@/components/characters/EditCharactersButton";
import { StoryList } from "@/components/stories/StoryList";
import type { SavedStory } from "@/components/stories/StoryCard";
import { createClient } from "@/lib/supabase/server";

export default async function StoriesPage() {
  const supabase = await createClient();

  const { data: stories, error } = await supabase
    .from("stories")
    .select("id, title, theme, saved_at")
    .eq("status", "saved")
    .eq("is_archived", false)
    .order("saved_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch stories:", error.message);
  }

  const savedStories: SavedStory[] = stories ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-2xl p-8">
      <header className="mb-8 flex flex-col items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">StoryGen</h1>
          <p className="mt-1 text-sm text-gray-600">Your saved stories</p>
        </div>
        <div className="flex shrink-0 items-center justify-between w-full gap-3">
          <div className="flex flex-row items-center gap-3">
            <Link
              href="/stories/new"
              className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              New Story
            </Link>
            <EditCharactersButton />
          </div>
          <SignOutButton />
        </div>
      </header>
      <div className="rounded-2xl border border-gray-400 p-2 text-xs text-gray-500 drop-shadow-lg">
        <StoryList stories={savedStories} />
      </div>
    </main>
  );
}
