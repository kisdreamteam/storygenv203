"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RegenerateButtonProps = {
  storyId: string;
};

export function RegenerateButton({ storyId }: RegenerateButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  async function handleRegenerate() {
    const confirmed = window.confirm(
      "Regenerating will replace the current story pages. Continue?"
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      const response = await fetch(`/api/stories/${storyId}/regenerate`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to regenerate story.");
        return;
      }

      if (data.warning) {
        setWarning(data.warning);
      }

      router.refresh();
    } catch {
      setError("Failed to regenerate story.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleRegenerate}
        disabled={loading}
        className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Regenerating…" : "Regenerate"}
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
