"use client";

import { useEffect, useState } from "react";

type PageEditorProps = {
  storyId: string;
  pageId: string;
  initialText: string;
  onTextChange?: (text: string) => void;
  onSaved?: (text: string) => void;
  onManualEdit?: () => void;
};

export function PageEditor({
  storyId,
  pageId,
  initialText,
  onTextChange,
  onSaved,
  onManualEdit,
}: PageEditorProps) {
  const [text, setText] = useState(initialText);
  const [savedText, setSavedText] = useState(initialText);
  const [committedBaseline, setCommittedBaseline] = useState(initialText);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(initialText);
    setSavedText(initialText);
    setCommittedBaseline(initialText);
    onTextChange?.(initialText);
  }, [initialText, onTextChange]);

  async function savePage(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      setText(savedText);
      setError("Page text cannot be empty.");
      setStatus("error");
      return;
    }

    if (trimmed === savedText) {
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
        body: JSON.stringify({ page_id: pageId, text: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        setText(savedText);
        setError(data.error ?? "Failed to save page.");
        setStatus("error");
        return;
      }

      setText(trimmed);
      setSavedText(trimmed);
      onSaved?.(trimmed);
      if (trimmed !== committedBaseline) {
        onManualEdit?.();
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setText(savedText);
      setError("Failed to save page.");
      setStatus("error");
    }
  }

  function handleBlur() {
    void savePage(text);
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onTextChange?.(e.target.value);
          if (error) setError(null);
        }}
        onBlur={handleBlur}
        rows={4}
        className="mt-3 w-full rounded border border-gray-300 px-3 py-2 text-sm leading-relaxed text-gray-900 focus:border-gray-500 focus:outline-none"
      />
      <div className="mt-1 flex items-center gap-2">
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
