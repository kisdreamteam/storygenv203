import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { StoryList } from "@/components/stories/StoryList";
import type { SavedStory } from "@/components/stories/StoryCard";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: stories, error } = await supabase
    .from("stories")
    .select("id, title, theme, saved_at")
    .eq("status", "saved")
    .order("saved_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch stories:", error.message);
  }

  const savedStories: SavedStory[] = stories ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-2xl p-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">StoryGen</h1>
          <p className="mt-1 text-sm text-gray-600">Your saved stories</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/stories/new"
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            New Story
          </Link>
          <SignOutButton />
        </div>
      </header>

      <StoryList stories={savedStories} />
    </main>
  );
}
