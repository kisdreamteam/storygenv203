"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  logStorySaveClicked,
  logStorySaveCompleted,
} from "@/lib/validation/workflow-log";

type SaveButtonProps = {
  storyId: string;
};

export function SaveButton({ storyId }: SaveButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  async function handleSave() {
    // Validation instrumentation only — not product analytics.
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

      router.push("/");
      router.refresh();
    } catch {
      setError("Failed to save story.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <p className="max-w-xs text-right text-xs text-gray-500">
        Saved stories appear on your home page and help Nina &amp; Nino remember
        past adventures.
      </p>
      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save story"}
      </button>
      {warning && (
        <p className="max-w-xs text-right text-xs text-amber-700" role="status">
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
