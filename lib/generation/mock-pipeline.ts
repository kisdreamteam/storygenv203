import type {
  MockGenerationResult,
  SeriesMemorySummary,
  StoryInputs,
} from "./types";

const NINA_DESCRIPTOR =
  "Nina is a 6-year-old girl, medium-brown skin, dark curly hair in two puffs, yellow shirt, blue overalls, red sneakers";

const NINO_DESCRIPTOR =
  "Nino is a 4-year-old boy, medium-brown skin, short curly dark hair, green shirt, tan shorts, blue sneakers";

const ILLUSTRATION_STYLE_SUFFIX =
  "Children's book illustration, warm soft colors, simple shapes, friendly expressions, clean background, ages 4-6, no text in image";

const DEFAULT_SETTING = "Sunny Grove Kindergarten neighborhood";
const PLACEHOLDER_WORDS = ["learn", "friend", "help", "share", "try"];

function truncateTitle(theme: string): string {
  const trimmed = theme.trim();
  return trimmed.length <= 60 ? trimmed : `${trimmed.slice(0, 57)}...`;
}

function resolveSetting(inputs: StoryInputs): string {
  return inputs.setting?.trim() || DEFAULT_SETTING;
}

function parseVocabularyWords(vocabularyFocus: string): string[] {
  const parsed = vocabularyFocus
    .split(/[,;]+/)
    .map((w) => w.trim())
    .filter(Boolean);

  const words = [...new Set(parsed)].slice(0, 7);

  for (const placeholder of PLACEHOLDER_WORDS) {
    if (words.length >= 5) break;
    if (!words.includes(placeholder)) words.push(placeholder);
  }

  return words.slice(0, 7);
}

function buildIllustrationPrompt(scene: string, setting: string, mood: string): string {
  return `${scene}. ${NINA_DESCRIPTOR}. ${NINO_DESCRIPTOR}. ${setting}. ${mood}. ${ILLUSTRATION_STYLE_SUFFIX}.`;
}

function buildPageTexts(
  inputs: StoryInputs,
  setting: string,
  memory: SeriesMemorySummary
): string[] {
  const { theme, learning_goal, main_events } = inputs;
  const hasMemory = memory.recent_stories.length > 0;
  const priorTheme = hasMemory
    ? memory.recent_stories[memory.recent_stories.length - 1]?.theme ?? "their last adventure"
    : "";

  const page1Open = hasMemory
    ? `Nina and Nino remember ${priorTheme}. Today they explore ${theme} together at ${setting}.`
    : `Nina and Nino woke up on a sunny morning. Today they will learn about ${theme} at ${setting}.`;

  return [
    `${page1Open} Their goal is simple: ${learning_goal}. Nino smiles. Nina says, "We can do this!"`,
    `Mom packs a small snack. Dad waves goodbye. Nina holds Nino's hand. They walk toward ${setting} with happy steps.`,
    `At ${setting}, Nina points and says, "Look!" Nino asks, "What is that?" They notice something new for their ${theme} story.`,
    `The main plan begins. ${main_events.split(".")[0] || main_events}. Nina listens carefully. Nino copies her brave smile.`,
    `They practice the learning goal: ${learning_goal}. Nina explains with short, clear words. Nino repeats each word with joy.`,
    `A small problem appears. Nino feels unsure for a moment. Nina says, "Let's try again together." They breathe and smile.`,
    `They use kind words and gentle hands. Nina shares an idea. Nino adds a funny hop. Their ${theme} adventure grows brighter.`,
    `Friends nearby cheer them on. Nina and Nino laugh softly. They remember ${learning_goal} and keep going step by step.`,
    `The hard part is solved with teamwork. Nino says, "We did it!" Nina claps once and gives a proud thumbs up.`,
    `They look around ${setting} and talk about what they learned. Nina names three things. Nino names two more with a grin.`,
    `Before heading home, they review ${theme} one more time. Nina says, "${learning_goal} matters." Nino nods and says, "Me too!"`,
    `At home, Nina and Nino tell Mom and Dad about their day. They feel proud, tired, and happy. Tomorrow brings another story.`,
  ];
}

function buildVocabulary(
  words: string[],
  theme: string
): MockGenerationResult["vocabulary"] {
  return words.map((word, index) => ({
    word,
    definition_or_example: `${word.charAt(0).toUpperCase() + word.slice(1)} is an important word in our story about ${theme}. Nina and Nino use it when they learn together.`,
    sort_order: index + 1,
  }));
}

export function runMockPipeline(
  inputs: StoryInputs,
  memory: SeriesMemorySummary
): MockGenerationResult {
  const setting = resolveSetting(inputs);
  const pageTexts = buildPageTexts(inputs, setting, memory);
  const vocabWords = parseVocabularyWords(inputs.vocabulary_focus);

  const pages = pageTexts.map((text, index) => {
    const pageNumber = index + 1;
    const mood =
      index < 4
        ? "Bright cheerful morning light"
        : index < 9
          ? "Warm playful afternoon light"
          : "Cozy warm evening light";

    const scene = text.split(".")[0] || text;

    return {
      page_number: pageNumber,
      text,
      illustration_prompt: buildIllustrationPrompt(scene, setting, mood),
    };
  });

  return {
    story: {
      title: truncateTitle(inputs.theme),
      status: "draft",
    },
    pages,
    vocabulary: buildVocabulary(vocabWords, inputs.theme),
  };
}
