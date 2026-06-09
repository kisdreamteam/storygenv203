"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StorySetupFields } from "@/components/story/StorySetupFields";
import {
  emptyStorySetupForm,
  isStorySetupFormValid,
  storySetupFormToPayload,
  type StorySetupFormState,
} from "@/lib/story/setup-form-state";
import {
  logStoryCreatePageOpened,
  logStoryGenerateClicked,
  logStoryGenerateCompleted,
} from "@/lib/validation/workflow-log";

export function StoryInputForm() {
  const router = useRouter();
  const generateStartedAt = useRef<number | null>(null);
  const [form, setForm] = useState<StorySetupFormState>(emptyStorySetupForm);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    logStoryCreatePageOpened();
  }, []);

  function updateField(field: keyof StorySetupFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setWarning(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isStorySetupFormValid(form)) return;

    setLoading(true);
    setError(null);
    setWarning(null);
    generateStartedAt.current = Date.now();
    logStoryGenerateClicked();

    try {
      const response = await fetch("/api/stories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storySetupFormToPayload(form)),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Generation failed. Please try again.");
        return;
      }

      if (data.warning) {
        setWarning(data.warning);
      }

      const durationMs =
        generateStartedAt.current !== null
          ? Date.now() - generateStartedAt.current
          : 0;
      logStoryGenerateCompleted(data.storyId, durationMs);

      router.push(`/stories/${data.storyId}`);
      router.refresh();
    } catch {
      setError("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const canGenerate = isStorySetupFormValid(form) && !loading;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-xl flex-col gap-5 rounded-md border border-gray-200 p-5"
    >
      <StorySetupFields
        form={form}
        onFieldChange={updateField}
        disabled={loading}
        showMoreOptions={showMoreOptions}
        onToggleMoreOptions={() => setShowMoreOptions((open) => !open)}
      />

      <p className="text-xs text-gray-500">
        Prototype note: story wording may still feel template-like while real AI
        generation is being prepared.
      </p>

      {warning && (
        <p className="rounded bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
          {warning}
        </p>
      )}

      {error && (
        <p className="rounded bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={!canGenerate}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate"}
        </button>
        <Link href="/stories" className="text-sm text-gray-600 hover:text-gray-900">
          Back to stories
        </Link>
      </div>
    </form>
  );
}
