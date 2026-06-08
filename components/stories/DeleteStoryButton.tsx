"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteStoryButtonProps = {
  storyId: string;
};

export function DeleteStoryButton({ storyId }: DeleteStoryButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      "Remove this story from your list? It will no longer appear on the home page."
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stories/${storyId}/archive`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to remove story.");
        return;
      }

      router.refresh();
    } catch {
      setError("Failed to remove story.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute right-2 top-2 z-10">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label="Remove story"
        className="rounded p-1 text-lg leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
      >
        ×
      </button>
      {error && (
        <p className="absolute right-0 top-full mt-1 w-40 text-right text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
