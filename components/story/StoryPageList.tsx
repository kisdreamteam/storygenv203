import { PageEditor } from "./PageEditor";
import { PromptCopyButton } from "./PromptCopyButton";

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
        <li
          key={page.id}
          className="rounded border border-gray-200 bg-white p-5"
        >
          <h3 className="text-sm font-semibold text-gray-500">
            Page {page.page_number}
          </h3>
          <PageEditor
            storyId={storyId}
            pageId={page.id}
            initialText={page.text}
          />
          <div className="mt-4 rounded bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-gray-500">Illustration prompt</p>
              <PromptCopyButton text={page.illustration_prompt} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              {page.illustration_prompt}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
