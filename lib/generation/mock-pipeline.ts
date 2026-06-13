import {
  DEFAULT_ILLUSTRATION_SETTING,
  sceneFromPageText,
} from "./illustration-prompt";
import { preferredVocabularyWords, type WeeklyPlan } from "@/lib/story/weekly-plan";
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

function buildInferredWeeklyPlan(inputs: StoryInputs): WeeklyPlan {
  const { theme, learning_goal, weeklyPlan } = inputs;
  const goalPhrase = learning_goal.trim()
    ? `set a goal tied to ${learning_goal}`
    : `learn about ${theme}`;
  const defaultBeats = [
    `Nina and Nino begin exploring ${theme} and ${goalPhrase}.`,
    `They practice and discover more about ${theme} through hands-on activities.`,
    `A small challenge appears; they work together to solve it.`,
    `They finish with meaningful learning about ${theme} and a warm closing moment.`,
  ];
  const defaultVocab = ["learn", "friend", "help", "share", "try"];

  return {
    week1: {
      events: weeklyPlan.week1.events.trim() || defaultBeats[0],
      vocabulary: weeklyPlan.week1.vocabulary.trim() || defaultVocab.slice(0, 2).join(", "),
    },
    week2: {
      events: weeklyPlan.week2.events.trim() || defaultBeats[1],
      vocabulary: weeklyPlan.week2.vocabulary.trim() || defaultVocab[2],
    },
    week3: {
      events: weeklyPlan.week3.events.trim() || defaultBeats[2],
      vocabulary: weeklyPlan.week3.vocabulary.trim() || defaultVocab[3],
    },
    week4: {
      events: weeklyPlan.week4.events.trim() || defaultBeats[3],
      vocabulary: weeklyPlan.week4.vocabulary.trim() || defaultVocab[4],
    },
  };
}

function buildPageTexts(
  inputs: StoryInputs,
  setting: string,
  variantIndex: number
): string[] {
  const { theme, learning_goal } = inputs;

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
    `Nina and Nino start their ${theme} adventure. They listen carefully and copy brave smiles.`,
    `They practice the learning goal: ${learning_goal}. Nina explains with short, clear words. Nino repeats each word with joy.`,
    `They explore more of ${theme}. ${page6}`,
    page7,
    `A new challenge appears in their ${theme} story. Nina and Nino work together with patient steps.`,
    `Friends nearby cheer them on. Nina and Nino laugh softly. They remember ${learning_goal} and keep going step by step.`,
    `The hard part is solved with teamwork. Nino says, "We did it!" Nina claps once and gives a proud thumbs up.`,
    `Their ${theme} story reaches a meaningful moment. Nina names three things. Nino names two more with a grin.`,
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
  const vocabWords = preferredVocabularyWords(inputs.weeklyPlan, inputs.vocabulary_focus);
  const parsedVocab = parseVocabularyWords(vocabWords.join(", "));

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
    vocabulary: buildVocabulary(parsedVocab, inputs.theme),
    inferred_weekly_plan: buildInferredWeeklyPlan(inputs),
  };
}
