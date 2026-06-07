import Link from "next/link";

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
    <Link
      href={`/stories/${story.id}`}
      className="block rounded border border-gray-200 bg-white p-4 hover:border-gray-300 hover:bg-gray-50"
    >
      <h2 className="font-medium text-gray-900">{story.title}</h2>
      <p className="mt-1 text-sm text-gray-600">{story.theme}</p>
      {savedDate && (
        <p className="mt-2 text-xs text-gray-500">Saved {savedDate}</p>
      )}
    </Link>
  );
}
