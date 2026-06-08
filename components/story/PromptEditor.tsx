"use client";

import { useEffect, useRef, useState } from "react";

type PromptEditorProps = {
  storyId: string;
  pageId: string;
  prompt: string;
  isEditing: boolean;
  onPromptChange: (prompt: string) => void;
  onEditingChange: (editing: boolean) => void;
  onManualEdit?: () => void;
};

const buttonClass =
  "rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

export function PromptEditor({
  storyId,
  pageId,
  prompt,
  isEditing,
  onPromptChange,
  onEditingChange,
  onManualEdit,
}: PromptEditorProps) {
  const [draft, setDraft] = useState(prompt);
  const [savedPrompt, setSavedPrompt] = useState(prompt);
  const [committedBaseline, setCommittedBaseline] = useState(prompt);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const wasEditing = useRef(isEditing);

  useEffect(() => {
    if (!isEditing) {
      setDraft(prompt);
      setSavedPrompt(prompt);
      setCommittedBaseline(prompt);
    }
  }, [prompt, isEditing]);

  useEffect(() => {
    if (isEditing && !wasEditing.current) {
      setDraft(prompt);
      setSavedPrompt(prompt);
    }
    wasEditing.current = isEditing;
  }, [isEditing, prompt]);

  function cancelEditing() {
    setDraft(savedPrompt);
    onPromptChange(savedPrompt);
    onEditingChange(false);
    setError(null);
    setStatus("idle");
  }

  async function savePrompt(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      setDraft(savedPrompt);
      setError("Illustration prompt cannot be empty.");
      setStatus("error");
      return;
    }

    if (trimmed === savedPrompt) {
      onEditingChange(false);
      setStatus("idle");
      setError(null);
      return;
    }

    setStatus("saving");
    setError(null);

    try {
      const response = await fetch(`/api/stories/${storyId}/pages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_id: pageId, illustration_prompt: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDraft(savedPrompt);
        setError(data.error ?? "Failed to save prompt.");
        setStatus("error");
        return;
      }

      setDraft(trimmed);
      setSavedPrompt(trimmed);
      onPromptChange(trimmed);
      onEditingChange(false);
      if (trimmed !== committedBaseline) {
        onManualEdit?.();
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setDraft(savedPrompt);
      setError("Failed to save prompt.");
      setStatus("error");
    }
  }

  function handleBlur() {
    if (isEditing) {
      void savePrompt(draft);
    }
  }

  if (isEditing) {
    return (
      <div>
        <textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          onBlur={handleBlur}
          rows={5}
          className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm leading-relaxed text-gray-700 focus:border-gray-500 focus:outline-none"
        />
        <div className="mt-2 flex items-center gap-2">
          <button type="button" onClick={cancelEditing} className={buttonClass}>
            Cancel
          </button>
          {status === "saving" && (
            <span className="text-xs text-gray-500">Saving…</span>
          )}
          {status === "saved" && (
            <span className="text-xs text-green-700">Saved</span>
          )}
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </div>
    );
  }

  return (
    <p className="mt-2 text-sm leading-relaxed text-gray-700">{prompt}</p>
  );
}

export function PromptEditButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={buttonClass}>
      Edit prompt
    </button>
  );
}
