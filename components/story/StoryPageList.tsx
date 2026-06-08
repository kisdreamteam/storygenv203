import { StoryPageItem } from "./StoryPageItem";

export type StoryPage = {
  id: string;
  page_number: number;
  text: string;
  illustration_prompt: string;
};

type StoryPageListProps = {
  storyId: string;
  pages: StoryPage[];
};

export function StoryPageList({ storyId, pages }: StoryPageListProps) {
  return (
    <ol className="flex flex-col gap-6">
      {pages.map((page) => (
        <StoryPageItem key={page.id} storyId={storyId} page={page} />
      ))}
    </ol>
  );
}
