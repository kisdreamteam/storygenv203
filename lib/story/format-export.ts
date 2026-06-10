import type { CharacterProfileMap } from "@/lib/character-profiles/types";
import { resolveProductionIllustrationPrompt } from "./resolve-production-prompt";

type StoryPageText = {
  page_number: number;
  text: string;
};

type StoryPagePrompt = {
  page_number: number;
  text: string;
  illustration_prompt: string;
};

function sortByPageNumber<T extends { page_number: number }>(pages: T[]): T[] {
  return [...pages].sort((a, b) => a.page_number - b.page_number);
}

export function formatStoryForCopy(title: string, pages: StoryPageText[]): string {
  const sorted = sortByPageNumber(pages);
  const body = sorted
    .map((page) => `Page ${page.page_number}\n${page.text.trim()}`)
    .join("\n\n");

  return `${title.trim()}\n\n${body}`;
}

export function formatIllustrationsForCopy(
  title: string,
  pages: StoryPagePrompt[],
  setting?: string | null,
  profiles?: CharacterProfileMap
): string {
  const sorted = sortByPageNumber(pages);
  const body = sorted
    .map((page) => {
      const prompt = resolveProductionIllustrationPrompt({
        pageText: page.text,
        pageNumber: page.page_number,
        setting,
        storedPrompt: page.illustration_prompt,
        profiles,
      });
      return `Page ${page.page_number}\n${prompt}`;
    })
    .join("\n\n");

  return `Illustration prompts — ${title.trim()}\n\n${body}`;
}
