import Link from "next/link";
import { StoryCard, type SavedStory } from "./StoryCard";

export function StoryList({ stories }: { stories: SavedStory[] }) {
  if (stories.length === 0) {
    return (
      <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No saved stories yet.</p>
        <Link
          href="/stories/new"
          className="mt-4 inline-block text-sm font-medium text-gray-900 underline hover:no-underline"
        >
          Create your first story
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {stories.map((story) => (
        <li key={story.id}>
          <StoryCard story={story} />
        </li>
      ))}
    </ul>
  );
}
