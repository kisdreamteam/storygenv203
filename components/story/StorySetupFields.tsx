"use client";

import type { ReactNode } from "react";
import type { OfficialCharacterKey } from "@/lib/character-profiles";
import {
  CHARACTER_TOGGLE_OPTIONS,
  characterHintsFromForm,
  needsSingleProtagonistWarning,
} from "@/lib/story/character-hints";
import {
  FORM_WEEK_FIELDS,
  type StorySetupFormState,
} from "@/lib/story/setup-form-state";

type StorySetupFieldsProps = {
  form: StorySetupFormState;
  onFieldChange: (field: keyof StorySetupFormState, value: string) => void;
  onCharacterToggle: (key: OfficialCharacterKey) => void;
  onOtherCharactersChange: (value: string) => void;
  disabled?: boolean;
  showMoreOptions: boolean;
  onToggleMoreOptions: () => void;
  idPrefix?: string;
  planAssistBanner?: ReactNode;
};

const inputClass =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-gray-700";
const helperClass = "mt-1 text-xs text-gray-500";

const WEEK_UI: Array<{
  eventsField: keyof StorySetupFormState;
  vocabularyField: keyof StorySetupFormState;
  weekLabel: string;
  pageRange: string;
  eventsHelper?: string;
  vocabHelper?: string;
  eventsPlaceholder: string;
  vocabPlaceholder: string;
}> = FORM_WEEK_FIELDS.map(({ eventsField, vocabularyField }, index) => {
  const weekNumber = index + 1;
  const pageRanges = ["1–3", "4–6", "7–9", "10–12"];
  const pageRange = pageRanges[index];
  return {
    eventsField,
    vocabularyField,
    weekLabel: `Week ${weekNumber}`,
    pageRange,
    eventsPlaceholder:
      index === 0
        ? "Arrive at the farm, see the animals, feed the animals."
        : index === 1
          ? "Tractor ride, see the corn, sunflowers, and beans."
          : index === 2
            ? "Find a sheep stuck in the bush, help the sheep."
            : "Realize the sheep had a lamb, see other baby animals.",
    vocabPlaceholder:
      index === 0
        ? "farm, cow, goat, feed"
        : index === 1
          ? "tractor, corn, sunflower, beans"
          : index === 2
            ? "sheep, stuck, bush, help"
            : "lamb, baby animals, ducklings, chicks",
  };
});

export function StorySetupFields({
  form,
  onFieldChange,
  onCharacterToggle,
  onOtherCharactersChange,
  disabled = false,
  showMoreOptions,
  onToggleMoreOptions,
  idPrefix = "",
  planAssistBanner,
}: StorySetupFieldsProps) {
  const id = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);
  const characterHints = characterHintsFromForm(
    form.selected_characters,
    form.other_characters
  );
  const showSingleProtagonistWarning = needsSingleProtagonistWarning(characterHints);
  const missingProtagonist = characterHints.official.includes("nina") ? "Nino" : "Nina";

  return (
    <div className="flex flex-col gap-4 ">
      <div className="flex flex-col gap-4 rounded-lg border-1 border-gray-200 p-4 drop-shadow-lg">
        <div>
          <label htmlFor={id("theme")} className={labelClass}>
            Monthly Topic <span className="text-red-600">*</span>
          </label>
          <input
            id={id("theme")}
            type="text"
            value={form.theme}
            onChange={(e) => onFieldChange("theme", e.target.value)}
            placeholder="Farm, Fire Station, Zoo, Birthday Party"
            className={inputClass}
            disabled={disabled}
          />
        </div>

        <div>
          <label htmlFor={id("learning_goal")} className={labelClass}>
            Learning Goal
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
          <p className={helperClass}>Optional — leave blank to infer from your topic.</p>
        </div>

        <div>
          <p className={labelClass}>Characters (optional)</p>
          <p className={helperClass}>
            Nina and Nino are selected by default. Choose who should appear in this story.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CHARACTER_TOGGLE_OPTIONS.map(({ key, label }) => {
              const selected = form.selected_characters.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onCharacterToggle(key)}
                  disabled={disabled}
                  aria-pressed={selected}
                  className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {showSingleProtagonistWarning && (
            <p className="mt-2 text-xs text-amber-700" role="status">
              Only one sibling is selected — {missingProtagonist} will not appear unless you
              add them back.
            </p>
          )}
          {!characterHints.official.some((key) => key === "nina" || key === "nino") && (
            <p className="mt-2 text-xs text-red-700" role="alert">
              Select at least Nina or Nino to generate a story.
            </p>
          )}
          <div className="mt-3">
            <label htmlFor={id("other_characters")} className={labelClass}>
              Other characters
            </label>
            <input
              id={id("other_characters")}
              type="text"
              value={form.other_characters}
              onChange={(e) => onOtherCharactersChange(e.target.value)}
              placeholder="Sam, Biscuit"
              className={inputClass}
              disabled={disabled}
            />
            <p className={helperClass}>Optional names to include when they fit the story.</p>
          </div>
        </div>
      </div>

      {planAssistBanner}

      <p className="text-sm text-gray-600">Optional weekly guidance</p>

      {WEEK_UI.map(
        ({
          eventsField,
          vocabularyField,
          weekLabel,
          pageRange,
          eventsHelper,
          vocabHelper,
          eventsPlaceholder,
          vocabPlaceholder,
        }) => (
          <div key={eventsField} className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {weekLabel} (pages {pageRange})
            </h3>
            <div>
              <label htmlFor={id(eventsField)} className={labelClass}>
                {weekLabel} guidance
              </label>
              <textarea
                id={id(eventsField)}
                rows={2}
                value={form[eventsField] as string}
                onChange={(e) => onFieldChange(eventsField, e.target.value)}
                placeholder={eventsPlaceholder}
                className={inputClass}
                disabled={disabled}
              />
              <p className={helperClass}>{eventsHelper}</p>
            </div>
            <div>
              <label htmlFor={id(vocabularyField)} className={labelClass}>
                {weekLabel} Vocabulary
              </label>
              <input
                id={id(vocabularyField)}
                type="text"
                value={form[vocabularyField] as string}
                onChange={(e) => onFieldChange(vocabularyField, e.target.value)}
                placeholder={vocabPlaceholder}
                className={inputClass}
                disabled={disabled}
              />
              <p className={helperClass}>{vocabHelper}</p>
            </div>
          </div>
        )
      )}

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
