"use client";

import { useCallback, useState } from "react";
import {
  formatIllustrationsForCopy,
  formatStoryForCopy,
} from "@/lib/story/format-export";
import { CopyTextButton } from "./CopyTextButton";
import { StoryPageItem } from "./StoryPageItem";
import type { StoryPage } from "./StoryPageList";

type StoryPagesSectionProps = {
  storyId: string;
  storyTitle: string;
  storySetting?: string | null;
  pages: StoryPage[];
};

export function StoryPagesSection({
  storyId,
  storyTitle,
  storySetting,
  pages,
}: StoryPagesSectionProps) {
  const [livePages, setLivePages] = useState<StoryPage[]>(pages);

  const updateLivePage = useCallback(
    (id: string, data: { text: string; illustration_prompt: string }) => {
      setLivePages((prev) =>
        prev.map((page) =>
          page.id === id
            ? { ...page, text: data.text, illustration_prompt: data.illustration_prompt }
            : page
        )
      );
    },
    []
  );

  const getStoryCopyText = useCallback(
    () => formatStoryForCopy(storyTitle, livePages),
    [storyTitle, livePages]
  );

  const getIllustrationsCopyText = useCallback(
    () => formatIllustrationsForCopy(storyTitle, livePages, storySetting),
    [storyTitle, livePages, storySetting]
  );

  return (
    <section className="mb-10 rounded-2xl border border-gray-300 p-5 drop-shadow-lg">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Story pages</h2>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <CopyTextButton label="Copy Story" getText={getStoryCopyText} />
          <CopyTextButton
            label="Copy Illustrations"
            getText={getIllustrationsCopyText}
          />
        </div>
      </div>
      <ol className="flex flex-col gap-6">
        {livePages.map((page) => (
          <StoryPageItem
            key={page.id}
            storyId={storyId}
            page={page}
            storySetting={storySetting}
            onLiveChange={updateLivePage}
          />
        ))}
      </ol>
    </section>
  );
}
