import {
  CONTINUITY_SECTION_HEADER,
  getCharacterContinuityText,
  GLOBAL_ILLUSTRATION_SUFFIX,
  moodForPageNumber,
  sceneFromPageText,
  SCENE_SECTION_HEADER,
  STYLE_SECTION_HEADER,
} from "@/lib/generation/character-continuity";
import { DEFAULT_ILLUSTRATION_SETTING } from "@/lib/generation/illustration-prompt";

export type ResolveProductionIllustrationPromptInput = {
  pageText: string;
  pageNumber: number;
  setting?: string | null;
  storedPrompt?: string | null;
};

function extractSceneSection(storedPrompt: string): string | null {
  const trimmed = storedPrompt.trim();
  if (!trimmed.includes(SCENE_SECTION_HEADER)) {
    return null;
  }

  const sceneStart =
    trimmed.indexOf(SCENE_SECTION_HEADER) + SCENE_SECTION_HEADER.length;
  const afterScene = trimmed.slice(sceneStart).replace(/^\s*\n+/, "");
  const styleIdx = afterScene.indexOf(STYLE_SECTION_HEADER);

  if (styleIdx >= 0) {
    const scene = afterScene.slice(0, styleIdx).trim();
    return scene || null;
  }

  const scene = afterScene.trim();
  return scene || null;
}

function defaultSceneContent(
  pageText: string,
  pageNumber: number,
  setting?: string | null
): string {
  const resolvedSetting = setting?.trim() || DEFAULT_ILLUSTRATION_SETTING;
  const parts = [
    sceneFromPageText(pageText),
    resolvedSetting,
    moodForPageNumber(pageNumber),
  ];
  return `${parts.join(". ")}.`;
}

function resolveSceneContent(input: ResolveProductionIllustrationPromptInput): string {
  const stored = input.storedPrompt?.trim() ?? "";

  const extractedScene = stored ? extractSceneSection(stored) : null;
  if (extractedScene) {
    return extractedScene.endsWith(".") ? extractedScene : `${extractedScene}.`;
  }

  if (stored && !stored.includes(CONTINUITY_SECTION_HEADER)) {
    return stored.endsWith(".") ? stored : `${stored}.`;
  }

  return defaultSceneContent(input.pageText, input.pageNumber, input.setting);
}

function assembleProductionPrompt(pageText: string, sceneContent: string): string {
  const continuity = getCharacterContinuityText(pageText);
  const scene = sceneContent.trim();
  const normalizedScene = scene.endsWith(".") ? scene : `${scene}.`;

  const sections: string[] = [];

  if (continuity) {
    sections.push(`${CONTINUITY_SECTION_HEADER}\n\n${continuity}`);
  }

  sections.push(`${SCENE_SECTION_HEADER}\n\n${normalizedScene}`);
  sections.push(`${STYLE_SECTION_HEADER}\n\n${GLOBAL_ILLUSTRATION_SUFFIX}`);

  return sections.join("\n\n");
}

/**
 * Resolves the full production illustration prompt for clipboard copy.
 * LOCKED CHARACTER CONTINUITY and STYLE are always injected; SCENE preserves teacher edits when present.
 */
export function resolveProductionIllustrationPrompt(
  input: ResolveProductionIllustrationPromptInput
): string {
  const sceneContent = resolveSceneContent(input);
  return assembleProductionPrompt(input.pageText, sceneContent);
}
