type StoryPageText = {
  page_number: number;
  text: string;
};

type StoryPagePrompt = {
  page_number: number;
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
  pages: StoryPagePrompt[]
): string {
  const sorted = sortByPageNumber(pages);
  const body = sorted
    .map(
      (page) =>
        `Page ${page.page_number}\n${page.illustration_prompt.trim()}`
    )
    .join("\n\n");

  return `Illustration prompts — ${title.trim()}\n\n${body}`;
}
