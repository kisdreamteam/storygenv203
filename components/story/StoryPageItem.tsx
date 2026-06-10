"use client";



import { useEffect, useState } from "react";

import type { CharacterProfileMap } from "@/lib/character-profiles/types";

import {

  resolveIllustrationSceneForDisplay,

  resolveProductionIllustrationPrompt,

} from "@/lib/story/resolve-production-prompt";

import { PageEditor } from "./PageEditor";

import { PromptCopyButton } from "./PromptCopyButton";

import { PromptEditButton, PromptEditor } from "./PromptEditor";

import { useStoryEditor } from "./StoryEditorContext";

import type { StoryPage } from "./StoryPageList";



type StoryPageItemProps = {

  storyId: string;

  page: StoryPage;

  storySetting?: string | null;

  profiles?: CharacterProfileMap;

  onLiveChange?: (

    id: string,

    data: { text: string; illustration_prompt: string }

  ) => void;

};



const actionButtonClass =

  "rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";



function initialScene(

  page: StoryPage,

  storySetting?: string | null

): string {

  return resolveIllustrationSceneForDisplay({

    pageText: page.text,

    pageNumber: page.page_number,

    setting: storySetting,

    storedPrompt: page.illustration_prompt,

  });

}



export function StoryPageItem({

  storyId,

  page,

  storySetting,

  profiles,

  onLiveChange,

}: StoryPageItemProps) {

  const { markDirty } = useStoryEditor();

  const [baselineText, setBaselineText] = useState(page.text);

  const [currentText, setCurrentText] = useState(page.text);

  const [prompt, setPrompt] = useState(() => initialScene(page, storySetting));

  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  const [isPromptVisible, setIsPromptVisible] = useState(false);

  const [regenLoading, setRegenLoading] = useState(false);

  const [regenError, setRegenError] = useState<string | null>(null);

  const [regenWarning, setRegenWarning] = useState<string | null>(null);



  const canRegeneratePrompt =

    currentText.trim() !== baselineText.trim() && !regenLoading;



  useEffect(() => {

    onLiveChange?.(page.id, {

      text: currentText,

      illustration_prompt: prompt,

    });

  }, [currentText, prompt, page.id, onLiveChange]);



  async function handleRegeneratePrompt() {

    if (!canRegeneratePrompt) return;



    setRegenLoading(true);

    setRegenError(null);

    setRegenWarning(null);



    try {

      const response = await fetch(

        `/api/stories/${storyId}/pages/regenerate-prompt`,

        {

          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({ page_id: page.id, text: currentText }),

        }

      );



      const data = await response.json();



      if (!response.ok) {

        setRegenError(data.error ?? "Failed to regenerate prompt.");

        return;

      }



      const savedText =

        typeof data.text === "string" ? data.text : currentText.trim();

      const newPrompt =

        typeof data.illustration_prompt === "string"

          ? data.illustration_prompt

          : prompt;



      setCurrentText(savedText);

      setBaselineText(savedText);

      setPrompt(newPrompt);

      if (data.warning) {

        setRegenWarning(data.warning);

      }

    } catch {

      setRegenError("Failed to regenerate prompt.");

    } finally {

      setRegenLoading(false);

    }

  }



  return (

    <li className="rounded-2xl border border-gray-400 bg-white p-5 drop-shadow-lg">

      <h3 className="text-sm font-semibold text-gray-500">

        Page {page.page_number}

      </h3>

      <PageEditor

        storyId={storyId}

        pageId={page.id}

        initialText={page.text}

        onTextChange={setCurrentText}

        onSaved={(text) => {

          setCurrentText(text);

        }}

        onManualEdit={markDirty}

      />

      <div className="mt-4 rounded border border-gray-300 bg-gray-50 p-4">

        <div className="flex flex-wrap items-start justify-between gap-3">

          <p className="text-xs font-medium text-gray-500">Illustration scene</p>

          <div className="flex flex-wrap items-center gap-2">

            <PromptCopyButton

              getText={() =>

                resolveProductionIllustrationPrompt({

                  pageText: currentText,

                  pageNumber: page.page_number,

                  setting: storySetting,

                  storedPrompt: prompt,

                  profiles,

                })

              }

            />

            <button

              type="button"

              onClick={() => setIsPromptVisible((visible) => !visible)}

              className={actionButtonClass}

            >

              {isPromptVisible ? "Hide Prompt" : "Show Prompt"}

            </button>

            <button

              type="button"

              onClick={handleRegeneratePrompt}

              disabled={!canRegeneratePrompt}

              className={actionButtonClass}

            >

              {regenLoading ? "Regenerating…" : "Regenerate prompt"}

            </button>

            {!isEditingPrompt && (

              <PromptEditButton onClick={() => setIsEditingPrompt(true)} />

            )}

          </div>

        </div>

        <PromptEditor

          storyId={storyId}

          pageId={page.id}

          prompt={prompt}

          isEditing={isEditingPrompt}

          visible={isPromptVisible}

          onPromptChange={setPrompt}

          onEditingChange={setIsEditingPrompt}

          onManualEdit={markDirty}

        />

        {regenWarning && (

          <p className="mt-2 text-xs text-amber-700" role="status">

            {regenWarning}

          </p>

        )}

        {regenError && (

          <p className="mt-2 text-xs text-red-600" role="alert">

            {regenError}

          </p>

        )}

      </div>

    </li>

  );

}

