import {
  DEFAULT_ILLUSTRATION_SETTING,
  sceneFromPageText,
} from "./illustration-prompt";
import {
  formatCharacterNamesForText,
  isCharacterSelected,
} from "@/lib/story/character-hints";
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
  const { theme, learning_goal, weeklyPlan, characterHints } = inputs;
  const cast = formatCharacterNamesForText(characterHints);
  const goalPhrase = learning_goal.trim()
    ? `set a goal tied to ${learning_goal}`
    : `learn about ${theme}`;
  const defaultBeats = [
    `${cast} begin exploring ${theme} and ${goalPhrase}.`,
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

function buildDeparturePage(cast: string, setting: string, inputs: StoryInputs): string {
  const hasMom = isCharacterSelected(inputs.characterHints, "mom");
  const hasDad = isCharacterSelected(inputs.characterHints, "dad");
  if (hasMom && hasDad) {
    return `Mom packs a small snack. Dad waves goodbye. ${cast} walk toward ${setting} with happy steps.`;
  }
  if (hasMom) {
    return `Mom packs a small snack and waves goodbye. ${cast} head toward ${setting} with happy steps.`;
  }
  if (hasDad) {
    return `Dad packs a small snack and waves goodbye. ${cast} head toward ${setting} with happy steps.`;
  }
  return `${cast} pack a small snack and head toward ${setting} with happy steps.`;
}

function buildEndingPage(
  cast: string,
  theme: string,
  variantIndex: number,
  inputs: StoryInputs
): string {
  const hasMom = isCharacterSelected(inputs.characterHints, "mom");
  const hasDad = isCharacterSelected(inputs.characterHints, "dad");
  const other = inputs.characterHints?.other?.trim();

  if (hasMom && hasDad) {
    return `At home, ${cast} tell Mom and Dad about their day. They feel proud, tired, and glad. Tomorrow brings another story.`;
  }
  if (hasMom) {
    return `At home, ${cast} tell Mom about their ${theme} day. They feel proud and glad. Tomorrow brings another story.`;
  }
  if (hasDad) {
    return `At home, ${cast} tell Dad about their ${theme} day. They feel proud and glad. Tomorrow brings another story.`;
  }

  const endings = [
    `Later, ${cast} draw a picture about ${theme}. They whisper about what they noticed. The day ends with a warm smile.`,
    `Before bed, ${cast} talk about one favorite moment from ${theme}. They say, "We helped each other today."`,
    other
      ? `${cast} wave to ${other} and share one favorite ${theme} moment. The day ends with a warm smile.`
      : `${cast} smile about their ${theme} adventure. The day ends with happy, tired steps.`,
  ];
  return endings[variantIndex % endings.length];
}

function buildPageTexts(
  inputs: StoryInputs,
  setting: string,
  variantIndex: number
): string[] {
  const { theme, learning_goal, characterHints } = inputs;
  const cast = formatCharacterNamesForText(characterHints);
  const goalLine = learning_goal.trim()
    ? learning_goal.trim()
    : `learn about ${theme}`;

  const page1Variants = [
    `${cast} woke up on a sunny morning. Today they will learn about ${theme} at ${setting}.`,
    `After breakfast, ${cast} get ready for ${theme}. They head to ${setting} with curious steps.`,
    `${cast} find a note about ${theme}. They wonder what they will do today at ${setting}.`,
  ];

  const page1Open = page1Variants[variantIndex % page1Variants.length];

  const middleVariants = [
    [
      `A small problem appears. Someone feels unsure for a moment. A friend says, "Let's try again together." They breathe and nod.`,
      `They use kind words and gentle hands. One shares an idea. Another adds a funny hop. Their ${theme} adventure grows brighter.`,
    ],
    [
      `Something tricky happens. They pause and watch. Someone whispers, "We can figure this out." They try a new way.`,
      `They test a new plan together. One points. Another copies the careful move. Their ${theme} task starts to work.`,
    ],
    [
      `A surprise twist shows up. Someone asks a question. They think, then nod. They choose a fresh approach.`,
      `They practice step by step. They name each part and repeat with a grin. Their ${theme} work moves forward.`,
    ],
  ];

  const [page6, page7] = middleVariants[variantIndex % middleVariants.length];

  return [
    `${page1Open} Their goal is simple: ${goalLine}. They smile and say, "We can do this!"`,
    buildDeparturePage(cast, setting, inputs),
    `At ${setting}, ${cast} point and say, "Look!" They notice something new for their ${theme} story.`,
    `${cast} start their ${theme} adventure. They listen carefully and copy brave smiles.`,
    `They practice their learning goal: ${goalLine}. They explain with short, clear words and repeat each word with joy.`,
    `They explore more of ${theme}. ${page6}`,
    page7,
    `A new challenge appears in their ${theme} story. ${cast} work together with patient steps.`,
    `Friends nearby cheer them on. ${cast} laugh softly. They remember ${goalLine} and keep going step by step.`,
    `The hard part is solved with teamwork. Someone says, "We did it!" Everyone claps once and gives a proud thumbs up.`,
    `Their ${theme} story reaches a meaningful moment. They name new things they learned with happy grins.`,
    buildEndingPage(cast, theme, variantIndex, inputs),
  ];
}

function buildVocabulary(
  words: string[],
  theme: string,
  cast: string
): MockGenerationResult["vocabulary"] {
  return words.map((word, index) => ({
    word,
    definition_or_example: `${word.charAt(0).toUpperCase() + word.slice(1)} is an important word in our story about ${theme}. ${cast} use it when they learn together.`,
    sort_order: index + 1,
  }));
}

export function runMockPipeline(
  inputs: StoryInputs,
  options?: GenerationOptions
): MockGenerationResult {
  const setting = resolveSetting(inputs);
  const variantIndex = resolveVariantIndex(options);
  const cast = formatCharacterNamesForText(inputs.characterHints);
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
    vocabulary: buildVocabulary(parsedVocab, inputs.theme, cast),
    inferred_weekly_plan: buildInferredWeeklyPlan(inputs),
  };
}
