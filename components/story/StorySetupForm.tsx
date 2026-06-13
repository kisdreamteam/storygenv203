"use client";

import { useState } from "react";
import type { OfficialCharacterKey } from "@/lib/character-profiles";
import type { CharacterHints } from "@/lib/story/character-hints";
import { toggleCharacterSelection } from "@/lib/story/character-hints";
import {
  isStorySetupFormValid,
  storySetupFormToPayload,
  storySetupFromStory,
  type StorySetupFormState,
} from "@/lib/story/setup-form-state";
import { StorySetupFields } from "./StorySetupFields";

export type StorySetupData = {
  theme: string;
  learning_goal: string;
  vocabulary_focus: string;
  weekly_plan?: unknown;
  main_events?: string | null;
  character_hints?: CharacterHints | null;
  setting: string | null;
  tone: string | null;
  words_to_avoid: string | null;
  notes: string | null;
};

type StorySetupFormProps = {
  storyId: string;
  initialSetup: StorySetupData;
  onSuccess?: () => void;
  onCancel?: () => void;
  idPrefix?: string;
};

export function StorySetupForm({
  storyId,
  initialSetup,
  onSuccess,
  onCancel,
  idPrefix = "edit-setup",
}: StorySetupFormProps) {
  const [form, setForm] = useState<StorySetupFormState>(() =>
    storySetupFromStory(initialSetup)
  );
  const [showMoreOptions, setShowMoreOptions] = useState(
    Boolean(
      initialSetup.setting ||
        initialSetup.tone ||
        initialSetup.words_to_avoid ||
        initialSetup.notes
    )
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof StorySetupFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  function handleCharacterToggle(key: OfficialCharacterKey) {
    setForm((prev) => ({
      ...prev,
      selected_characters: toggleCharacterSelection(prev.selected_characters, key),
    }));
    setError(null);
  }

  function handleOtherCharactersChange(value: string) {
    setForm((prev) => ({ ...prev, other_characters: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isStorySetupFormValid(form)) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stories/${storyId}/setup`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storySetupFormToPayload(form)),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to save setup.");
        return;
      }

      onSuccess?.();
    } catch {
      setError("Failed to save setup.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = isStorySetupFormValid(form) && !loading;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <StorySetupFields
        form={form}
        onFieldChange={updateField}
        onCharacterToggle={handleCharacterToggle}
        onOtherCharactersChange={handleOtherCharactersChange}
        disabled={loading}
        showMoreOptions={showMoreOptions}
        onToggleMoreOptions={() => setShowMoreOptions((open) => !open)}
        idPrefix={idPrefix}
      />

      <p className="text-xs text-gray-500">
        Click Regenerate to apply these changes to story pages.
      </p>

      {error && (
        <p className="rounded bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save setup"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
