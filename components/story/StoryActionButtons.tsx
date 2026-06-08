"use client";

import { EditStorySetupButton } from "./EditStorySetupButton";
import { RegenerateButton } from "./RegenerateButton";
import type { StorySetupData } from "./StorySetupForm";

type StoryActionButtonsProps = {
  storyId: string;
  setup: StorySetupData;
};

export function StoryActionButtons({ storyId, setup }: StoryActionButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <EditStorySetupButton storyId={storyId} setup={setup} />
      <RegenerateButton storyId={storyId} />
    </div>
  );
}
