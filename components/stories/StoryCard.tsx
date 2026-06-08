import Link from "next/link";
import { DeleteStoryButton } from "./DeleteStoryButton";

export type SavedStory = {
  id: string;
  title: string;
  theme: string;
  saved_at: string | null;
};

export function StoryCard({ story }: { story: SavedStory }) {
  const savedDate = story.saved_at
    ? new Date(story.saved_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="relative rounded-md border border-gray-200 bg-yellow-50 hover:border-gray-300 hover:bg-gray-50">
      <DeleteStoryButton storyId={story.id} />
      <Link href={`/stories/${story.id}`} className="block p-4 pr-10">
        <h2 className="font-medium text-gray-900">{story.title}</h2>
        <p className="mt-1 text-sm text-gray-600">{story.theme}</p>
        {savedDate && (
          <p className="mt-2 text-xs text-gray-500">Saved {savedDate}</p>
        )}
      </Link>
    </div>
  );
}
