import type { CharacterProfileMap } from "@/lib/character-profiles/types";
import {
  buildIllustrationPrompt,
  CONTINUITY_SECTION_HEADER,
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
  profiles?: CharacterProfileMap;
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

function isLegacyFullPrompt(stored: string): boolean {
  return (
    stored.includes(CONTINUITY_SECTION_HEADER) ||
    stored.includes(SCENE_SECTION_HEADER)
  );
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

/**
 * Returns the short scene string for UI display and edit.
 * Legacy full prompts are reduced to their SCENE section; scene-only rows pass through.
 */
export function resolveIllustrationSceneForDisplay(
  input: ResolveProductionIllustrationPromptInput
): string {
  return resolveSceneContent(input);
}

/**
 * Resolves the full production illustration prompt for clipboard copy.
 * Assembles LOCKED CHARACTER CONTINUITY + SCENE + STYLE from profiles and stored scene.
 */
export function resolveProductionIllustrationPrompt(
  input: ResolveProductionIllustrationPromptInput
): string {
  const stored = input.storedPrompt?.trim() ?? "";
  const sceneContent = resolveSceneContent(input);
  const resolvedSetting =
    input.setting?.trim() || DEFAULT_ILLUSTRATION_SETTING;

  if (isLegacyFullPrompt(stored)) {
    return buildIllustrationPrompt({
      pageText: input.pageText,
      scene: sceneContent,
      profiles: input.profiles,
    });
  }

  return buildIllustrationPrompt({
    pageText: input.pageText,
    pageNumber: input.pageNumber,
    setting: resolvedSetting,
    scene: sceneContent,
    profiles: input.profiles,
  });
}
