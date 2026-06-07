"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  logStoryCreatePageOpened,
  logStoryGenerateClicked,
  logStoryGenerateCompleted,
} from "@/lib/validation/workflow-log";

type FormState = {
  theme: string;
  learning_goal: string;
  vocabulary_focus: string;
  main_events: string;
  setting: string;
  tone: string;
  words_to_avoid: string;
  notes: string;
};

const emptyForm: FormState = {
  theme: "",
  learning_goal: "",
  vocabulary_focus: "",
  main_events: "",
  setting: "",
  tone: "",
  words_to_avoid: "",
  notes: "",
};

function isFormValid(form: FormState): boolean {
  return (
    form.theme.trim() !== "" &&
    form.learning_goal.trim() !== "" &&
    form.vocabulary_focus.trim() !== "" &&
    form.main_events.trim() !== ""
  );
}

export function StoryInputForm() {
  const router = useRouter();
  const generateStartedAt = useRef<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Validation instrumentation only — not product analytics.
  useEffect(() => {
    logStoryCreatePageOpened();
  }, []);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setWarning(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid(form)) return;

    setLoading(true);
    setError(null);
    setWarning(null);
    generateStartedAt.current = Date.now();
    logStoryGenerateClicked();

    try {
      const response = await fetch("/api/stories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: form.theme.trim(),
          learning_goal: form.learning_goal.trim(),
          vocabulary_focus: form.vocabulary_focus.trim(),
          main_events: form.main_events.trim(),
          setting: form.setting.trim() || undefined,
          tone: form.tone.trim() || undefined,
          words_to_avoid: form.words_to_avoid.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
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

  const canGenerate = isFormValid(form) && !loading;

  const inputClass =
    "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none";
  const labelClass = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
      <div>
        <label htmlFor="theme" className={labelClass}>
          Theme / Topic <span className="text-red-600">*</span>
        </label>
        <input
          id="theme"
          type="text"
          value={form.theme}
          onChange={(e) => updateField("theme", e.target.value)}
          placeholder="A park adventure, classroom kindness, visiting the fire station"
          className={inputClass}
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="learning_goal" className={labelClass}>
          Learning Goal <span className="text-red-600">*</span>
        </label>
        <input
          id="learning_goal"
          type="text"
          value={form.learning_goal}
          onChange={(e) => updateField("learning_goal", e.target.value)}
          placeholder="Students practice sharing, taking turns, or naming classroom objects."
          className={inputClass}
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="vocabulary_focus" className={labelClass}>
          Vocabulary Focus <span className="text-red-600">*</span>
        </label>
        <input
          id="vocabulary_focus"
          type="text"
          value={form.vocabulary_focus}
          onChange={(e) => updateField("vocabulary_focus", e.target.value)}
          placeholder="share, turn, kind, help, together"
          className={inputClass}
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="main_events" className={labelClass}>
          Main Events <span className="text-red-600">*</span>
        </label>
        <textarea
          id="main_events"
          rows={3}
          value={form.main_events}
          onChange={(e) => updateField("main_events", e.target.value)}
          placeholder="Nina and Nino play at the park, take turns on the slide, and help a friend."
          className={inputClass}
          disabled={loading}
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowMoreOptions((open) => !open)}
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
          aria-expanded={showMoreOptions}
        >
          {showMoreOptions ? "Hide more options" : "More options"}
        </button>
        {showMoreOptions && (
          <div className="mt-4 flex flex-col gap-5">
            <div>
              <label htmlFor="setting" className={labelClass}>
                Setting
              </label>
              <input
                id="setting"
                type="text"
                value={form.setting}
                onChange={(e) => updateField("setting", e.target.value)}
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="tone" className={labelClass}>
                Tone
              </label>
              <input
                id="tone"
                type="text"
                value={form.tone}
                onChange={(e) => updateField("tone", e.target.value)}
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="words_to_avoid" className={labelClass}>
                Words to avoid
              </label>
              <input
                id="words_to_avoid"
                type="text"
                value={form.words_to_avoid}
                onChange={(e) => updateField("words_to_avoid", e.target.value)}
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="notes" className={labelClass}>
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className={inputClass}
                disabled={loading}
              />
            </div>
          </div>
        )}
      </div>

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
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
          Back to stories
        </Link>
      </div>
    </form>
  );
}
