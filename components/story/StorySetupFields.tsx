"use client";

import type { StorySetupFormState } from "@/lib/story/setup-form-state";

type StorySetupFieldsProps = {
  form: StorySetupFormState;
  onFieldChange: (field: keyof StorySetupFormState, value: string) => void;
  disabled?: boolean;
  showMoreOptions: boolean;
  onToggleMoreOptions: () => void;
  idPrefix?: string;
};

const inputClass =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-gray-700";

export function StorySetupFields({
  form,
  onFieldChange,
  disabled = false,
  showMoreOptions,
  onToggleMoreOptions,
  idPrefix = "",
}: StorySetupFieldsProps) {
  const id = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label htmlFor={id("theme")} className={labelClass}>
          Theme / Topic <span className="text-red-600">*</span>
        </label>
        <input
          id={id("theme")}
          type="text"
          value={form.theme}
          onChange={(e) => onFieldChange("theme", e.target.value)}
          placeholder="A park adventure, classroom kindness, visiting the fire station"
          className={inputClass}
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor={id("learning_goal")} className={labelClass}>
          Learning Goal <span className="text-red-600">*</span>
        </label>
        <input
          id={id("learning_goal")}
          type="text"
          value={form.learning_goal}
          onChange={(e) => onFieldChange("learning_goal", e.target.value)}
          placeholder="Students practice sharing, taking turns, or naming classroom objects."
          className={inputClass}
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor={id("vocabulary_focus")} className={labelClass}>
          Vocabulary Focus <span className="text-red-600">*</span>
        </label>
        <input
          id={id("vocabulary_focus")}
          type="text"
          value={form.vocabulary_focus}
          onChange={(e) => onFieldChange("vocabulary_focus", e.target.value)}
          placeholder="share, turn, kind, help, together"
          className={inputClass}
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor={id("main_events")} className={labelClass}>
          Main Events <span className="text-red-600">*</span>
        </label>
        <textarea
          id={id("main_events")}
          rows={3}
          value={form.main_events}
          onChange={(e) => onFieldChange("main_events", e.target.value)}
          placeholder="Nina and Nino play at the park, take turns on the slide, and help a friend."
          className={inputClass}
          disabled={disabled}
        />
      </div>

      <div>
        <button
          type="button"
          onClick={onToggleMoreOptions}
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
          aria-expanded={showMoreOptions}
        >
          {showMoreOptions ? "Hide more options" : "More options"}
        </button>
        {showMoreOptions && (
          <div className="mt-4 flex flex-col gap-5">
            <div>
              <label htmlFor={id("setting")} className={labelClass}>
                Setting
              </label>
              <input
                id={id("setting")}
                type="text"
                value={form.setting}
                onChange={(e) => onFieldChange("setting", e.target.value)}
                className={inputClass}
                disabled={disabled}
              />
            </div>

            <div>
              <label htmlFor={id("tone")} className={labelClass}>
                Tone
              </label>
              <input
                id={id("tone")}
                type="text"
                value={form.tone}
                onChange={(e) => onFieldChange("tone", e.target.value)}
                className={inputClass}
                disabled={disabled}
              />
            </div>

            <div>
              <label htmlFor={id("words_to_avoid")} className={labelClass}>
                Words to avoid
              </label>
              <input
                id={id("words_to_avoid")}
                type="text"
                value={form.words_to_avoid}
                onChange={(e) => onFieldChange("words_to_avoid", e.target.value)}
                className={inputClass}
                disabled={disabled}
              />
            </div>

            <div>
              <label htmlFor={id("notes")} className={labelClass}>
                Notes
              </label>
              <textarea
                id={id("notes")}
                rows={3}
                value={form.notes}
                onChange={(e) => onFieldChange("notes", e.target.value)}
                className={inputClass}
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
