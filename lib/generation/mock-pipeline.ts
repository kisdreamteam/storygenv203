import {
  DEFAULT_ILLUSTRATION_SETTING,
  sceneFromPageText,
} from "./illustration-prompt";
import type {
  GenerationOptions,
  MockGenerationResult,
  StoryInputs,
} from "./types";

const DEFAULT_SETTING = DEFAULT_ILLUSTRATION_SETTING;
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

function resolveVariantIndex(options?: GenerationOptions): number {
  if (options?.mode !== "regenerate") return 0;
  const seed = options.previousPages?.[0]?.text.length ?? 0;
  return seed % 3;
}

function buildPageTexts(
  inputs: StoryInputs,
  setting: string,
  variantIndex: number
): string[] {
  const { theme, learning_goal, main_events } = inputs;

  const page1Variants = [
    `Nina and Nino woke up on a sunny morning. Today they will learn about ${theme} at ${setting}.`,
    `After breakfast, Nina and Nino get ready for ${theme}. They head to ${setting} with curious steps.`,
    `Nina finds a note about ${theme}. Nino wonders what they will do today at ${setting}.`,
  ];

  const page1Open = page1Variants[variantIndex % page1Variants.length];

  const middleVariants = [
    [
      `A small problem appears. Nino feels unsure for a moment. Nina says, "Let's try again together." They breathe and nod.`,
      `They use kind words and gentle hands. Nina shares an idea. Nino adds a funny hop. Their ${theme} adventure grows brighter.`,
    ],
    [
      `Something tricky happens. Nino pauses and watches. Nina whispers, "We can figure this out." They try a new way.`,
      `They test a new plan together. Nina points. Nino copies her careful move. Their ${theme} task starts to work.`,
    ],
    [
      `A surprise twist shows up. Nino asks a question. Nina thinks, then nods. They choose a fresh approach.`,
      `They practice step by step. Nina names each part. Nino repeats with a grin. Their ${theme} work moves forward.`,
    ],
  ];

  const [page6, page7] = middleVariants[variantIndex % middleVariants.length];

  const endingVariants = [
    `At home, Nina and Nino tell Mom and Dad about their day. They feel proud, tired, and glad. Tomorrow brings another story.`,
    `Later, Nina and Nino draw a picture about ${theme}. They whisper about what they noticed. The day ends with a warm smile.`,
    `Before bed, Nina and Nino talk about one favorite moment. Nino yawns. Nina says, "We helped each other today."`,
  ];

  return [
    `${page1Open} Their goal is simple: ${learning_goal}. Nino smiles. Nina says, "We can do this!"`,
    `Mom packs a small snack. Dad waves goodbye. Nina holds Nino's hand. They walk toward ${setting} with happy steps.`,
    `At ${setting}, Nina points and says, "Look!" Nino asks, "What is that?" They notice something new for their ${theme} story.`,
    `The main plan begins. ${main_events.split(".")[0] || main_events}. Nina listens carefully. Nino copies her brave smile.`,
    `They practice the learning goal: ${learning_goal}. Nina explains with short, clear words. Nino repeats each word with joy.`,
    page6,
    page7,
    `Friends nearby cheer them on. Nina and Nino laugh softly. They remember ${learning_goal} and keep going step by step.`,
    `The hard part is solved with teamwork. Nino says, "We did it!" Nina claps once and gives a proud thumbs up.`,
    `They look around ${setting} and talk about what they learned. Nina names three things. Nino names two more with a grin.`,
    `Before heading home, they review ${theme} one more time. Nina says, "${learning_goal} matters." Nino nods and says, "Me too!"`,
    endingVariants[variantIndex % endingVariants.length],
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
  options?: GenerationOptions
): MockGenerationResult {
  const setting = resolveSetting(inputs);
  const variantIndex = resolveVariantIndex(options);
  const pageTexts = buildPageTexts(inputs, setting, variantIndex);
  const vocabWords = parseVocabularyWords(inputs.vocabulary_focus);

  const pages = pageTexts.map((text, index) => {
    const pageNumber = index + 1;

    return {
      page_number: pageNumber,
      text,
      illustration_prompt: sceneFromPageText(text),
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
