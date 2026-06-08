"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  logStorySaveClicked,
  logStorySaveCompleted,
} from "@/lib/validation/workflow-log";
import { useStoryEditor } from "./StoryEditorContext";

type SaveButtonProps = {
  storyId: string;
};

export function SaveButton({ storyId }: SaveButtonProps) {
  const router = useRouter();
  const { isDirty, clearDirty } = useStoryEditor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  async function handleSave() {
    if (!isDirty || loading) return;

    logStorySaveClicked(storyId);

    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      const response = await fetch(`/api/stories/${storyId}/save`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to save story.");
        return;
      }

      if (data.warning) {
        setWarning(data.warning);
      }

      logStorySaveCompleted(storyId);
      clearDirty();

      router.push("/");
      router.refresh();
    } catch {
      setError("Failed to save story.");
    } finally {
      setLoading(false);
    }
  }

  const disabled = !isDirty || loading;

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleSave}
        disabled={disabled}
        className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save story"}
      </button>
      {!isDirty && !loading && (
        <p className="text-xs text-gray-500">Save when you&apos;ve <br /> edited the story.</p>
      )}
      {warning && (
        <p className="max-w-xs text-xs text-amber-700" role="status">
          {warning}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
