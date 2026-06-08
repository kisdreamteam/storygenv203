"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStoryEditor } from "./StoryEditorContext";
import { StorySetupForm, type StorySetupData } from "./StorySetupForm";

type EditStorySetupButtonProps = {
  storyId: string;
  setup: StorySetupData;
};

export function EditStorySetupButton({ storyId, setup }: EditStorySetupButtonProps) {
  const router = useRouter();
  const { markDirty } = useStoryEditor();
  const [open, setOpen] = useState(false);

  function handleClose() {
    setOpen(false);
  }

  function handleSuccess() {
    markDirty();
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Edit Story Setup
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={handleClose}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-story-setup-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="edit-story-setup-title" className="mb-4 text-lg font-semibold">
              Edit Story Setup
            </h2>
            <StorySetupForm
              storyId={storyId}
              initialSetup={setup}
              onSuccess={handleSuccess}
              onCancel={handleClose}
            />
          </div>
        </div>
      )}
    </>
  );
}
