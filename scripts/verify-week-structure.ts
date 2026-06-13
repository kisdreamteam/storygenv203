/**
 * Verify topic-centered four-week story structure parsing, validation, and prompts.
 * Run: npm run verify:week-structure
 */
import { buildSystemPrompt, buildUserPrompt } from "@/lib/generation/prompts";
import { EMPTY_SERIES_MEMORY } from "@/lib/generation/types";
import { aggregateVocabularyFocus, weeklyPlanFromMainEventsText } from "@/lib/story/weekly-plan";
import {
  isRepairableWeekStructureFailure,
  validateGenerationOutputWithWeeks,
} from "@/lib/generation/validate-output";
import {
  detectWeekLanguageInText,
  extractDistinctiveWeekKeywords,
  extractTopicKeywords,
  extractWeekKeywords,
  formatWeekAdherenceRepairPrompt,
  hasFourWeekStructure,
  parseWeekEvents,
  validateWeekAdherence,
  validateWeekStructure,
} from "@/lib/generation/week-structure";
import { getFactoryCharacterProfiles } from "@/lib/character-profiles";

type Check = { name: string; ok: boolean; detail: string };
const checks: Check[] = [];

function record(name: string, ok: boolean, detail = "") {
  checks.push({ name, ok, detail });
}

function makeWords(count: number, prefix: string): string {
  return Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`).join(" ");
}

function makePageText(extra: string, topic?: string): string {
  const topicPart = topic ? `${topic} ` : "";
  return `${topicPart}${extra}. Nina and Nino explore together with friends. They learn new words together each day. ${makeWords(10, "word")}.`;
}

function makePageTextFromConcepts(concepts: string[], topic?: string): string {
  return makePageText(concepts.join(" "), topic);
}

function makeStoryPayload(
  blockTopics: string[][],
  options?: { topic?: string; omitTopicInBlocks?: number[] }
) {
  const pages = blockTopics.flatMap((topics, blockIndex) => {
    const startPage = blockIndex * 3 + 1;
    const omitTopic = options?.omitTopicInBlocks?.includes(blockIndex + 1);
    return topics.map((topicWord, offset) => ({
      page_number: startPage + offset,
      text: omitTopic
        ? makePageTextFromConcepts([topicWord])
        : makePageTextFromConcepts([topicWord], options?.topic),
      illustration_scene: makeWords(12, "scene"),
    }));
  });

  return {
    story: { title: "Test Story" },
    pages,
    vocabulary: [{ word: "test", definition_or_example: "A test word.", sort_order: 1 }],
  };
}

const SCENARIOS = {
  farm: {
    theme: "Farm",
    learning_goal: "Learn about farm animals and caring for animals",
    vocabulary_focus: "farm, tractor, sheep, barn, baby",
    main_events: `Week 1:
Meet farm animals and learn about farm life.

Week 2:
Ride a tractor through corn and sunflower fields.

Week 3:
Find and help a sheep stuck in a fence.

Week 4:
Learn about baby farm animals after the sheep has a lamb.`,
  },
  fireStation: {
    theme: "Fire Station",
    learning_goal: "Learn how firefighters help the community",
    vocabulary_focus: "firefighter, truck, helmet, safety, help",
    main_events: `Week 1:
Arrive at the fire station and meet the firefighters.

Week 2:
Tour the fire truck and try on safety helmets.

Week 3:
Hear the alarm, watch firefighters respond to a small practice call.

Week 4:
Learn about fire safety at home with the fire station team.`,
  },
  zoo: {
    theme: "Zoo",
    learning_goal: "Learn about zoo animals and habitats",
    vocabulary_focus: "zoo, habitat, giraffe, penguin, keeper",
    main_events: `Week 1:
Enter the zoo and visit the giraffe habitat.

Week 2:
Watch the penguin feeding and talk with a zoo keeper.

Week 3:
Hear a bird call, find a lost map, help a younger visitor.

Week 4:
Learn about protecting zoo animals and share a favorite animal.`,
  },
  birthdayParty: {
    theme: "Birthday Party",
    learning_goal: "Practice sharing and celebrating together",
    vocabulary_focus: "party, share, cake, friend, celebrate",
    main_events: `Week 1:
Arrive at the party and decorate with friends.

Week 2:
Play party games and practice taking turns.

Week 3:
Hear a surprise, find a missing gift bag, help a friend.

Week 4:
Share cake at the party and celebrate together warmly.`,
  },
  lostToy: {
    theme: "Lost Toy",
    learning_goal: "Practice problem solving and helping others",
    vocabulary_focus: "lost, find, help, toy, together",
    main_events: `Week 1:
Notice a lost toy at school and ask teachers for help.

Week 2:
Search the classroom and playground for clues.

Week 3:
Hear a student cry, find the toy under a bench, return it.

Week 4:
Talk about caring for toys and share a kind moment at school.`,
  },
} as const;

const factory = getFactoryCharacterProfiles();

record(
  "parse_farm_four_weeks",
  parseWeekEvents(SCENARIOS.farm.main_events)?.length === 4,
  "farm scenario has four weeks"
);
record(
  "farm_topic_keywords",
  extractTopicKeywords(SCENARIOS.farm.theme).includes("farm"),
  extractTopicKeywords(SCENARIOS.farm.theme).join(", ")
);
record(
  "farm_week2_keywords",
  extractWeekKeywords("Ride a tractor through corn and sunflower fields.").some((k) =>
    ["tractor", "corn", "sunflower"].includes(k)
  ),
  extractWeekKeywords("Ride a tractor through corn and sunflower fields.").join(", ")
);

const farmGood = makeStoryPayload(
  [
    ["arrive", "feed", "barn"],
    ["tractor", "corn", "sunflower"],
    ["sheep", "fence", "stuck"],
    ["lamb", "baby", "pregnant"],
  ],
  { topic: "farm" }
);
for (const [index, extra] of [
  "farm meet animals farm life arrive barn feed hay",
  "farm meet animals feed buckets hungry cows",
  "farm feed animals grain trough nina",
  "farm tractor corn sunflowers beans",
  "farm tractor ride sunflower rows",
  "farm corn beans tractor fields",
  "farm sheep fence stuck baa",
  "farm sheep fence help farmer",
  "farm help sheep fence free",
  "farm lamb baby animals newborn",
  "farm pregnant sheep lamb newborn",
  "farm baby animals lamb nino",
].entries()) {
  farmGood.pages[index].text = makePageText(extra, "farm");
}

const farmBadDrift = makeStoryPayload(
  [
    ["animals", "farm", "life"],
    ["horse", "cow", "garden"],
    ["sheep", "fence", "help"],
    ["happy", "learned", "wonderful"],
  ],
  { topic: "farm" }
);

const farmBadTopicDisconnect = makeStoryPayload(
  [
    ["animals", "farm", "life"],
    ["tractor", "corn", "sunflower"],
    ["sheep", "fence", "help"],
    ["baby", "lamb", "animals"],
  ],
  { topic: "farm", omitTopicInBlocks: [2] }
);

const farmRecapEnding = makeStoryPayload(
  [
    ["animals", "farm", "life"],
    ["tractor", "corn", "sunflower"],
    ["sheep", "fence", "help"],
    ["everyone", "learned", "wonderful"],
  ],
  { topic: "farm" }
);
farmRecapEnding.pages[9].text =
  "Everyone learned a lot today at the farm. They had fun and felt proud. What a wonderful day together. They remember today with smiles and waves. Nina and Nino talk about the day.";
farmRecapEnding.pages[10].text =
  "They learned so much and said goodbye at the farm. It was a great day with happy memories. Everyone was happy together. Nina and Nino smile at their friends.";
farmRecapEnding.pages[11].text =
  "Nina and Nino wave goodbye after a fun farm day. They learned a lot and feel proud. What a wonderful day at the farm with friends nearby.";

record(
  "farm_good_passes_validation",
  validateWeekStructure(farmGood, SCENARIOS.farm.main_events, SCENARIOS.farm.theme).ok ===
    true,
  "aligned farm story passes"
);
const farmBadCheck = validateWeekStructure(
  farmBadDrift,
  SCENARIOS.farm.main_events,
  SCENARIOS.farm.theme
);
record(
  "farm_bad_drift_fails",
  farmBadCheck.ok === false,
  farmBadCheck.ok ? "unexpected pass" : farmBadCheck.reason ?? ""
);
record(
  "farm_topic_disconnect_fails",
  validateWeekStructure(
    farmBadTopicDisconnect,
    SCENARIOS.farm.main_events,
    SCENARIOS.farm.theme
  ).ok === false,
  "week 2 block missing Topic anchor fails"
);
record(
  "farm_recap_ending_fails",
  validateWeekStructure(farmRecapEnding, SCENARIOS.farm.main_events, SCENARIOS.farm.theme)
    .ok === false,
  "recap-heavy Week 4 fails"
);

const farmWeekLanguageLeak = makeStoryPayload(
  [
    ["animals", "farm", "life"],
    ["tractor", "corn", "sunflower"],
    ["sheep", "fence", "help"],
    ["baby", "lamb", "animals"],
  ],
  { topic: "farm" }
);
farmWeekLanguageLeak.pages[6].text =
  "On week three Nina and Nino hear a soft baa near the fence. They walk carefully toward the sound. A sheep is stuck and needs help. They stay calm and work together. The farmer smiles when they call for help.";

record(
  "farm_week_language_leak_fails",
  validateWeekStructure(farmWeekLanguageLeak, SCENARIOS.farm.main_events, SCENARIOS.farm.theme)
    .ok === false,
  "week planning language in story text fails validation"
);
record(
  "week_language_leak_repairable",
  isRepairableWeekStructureFailure(farmWeekLanguageLeak),
  "week-language leak is repairable"
);
record(
  "detect_week_language",
  detectWeekLanguageInText("On the second week they rode the tractor") === "second week",
  "week language detector"
);

const farmWeek4Early = makeStoryPayload(
  [
    ["animals", "farm", "life"],
    ["tractor", "corn", "sunflower"],
    ["sheep", "fence", "lamb"],
    ["happy", "learned", "wonderful"],
  ],
  { topic: "farm" }
);
farmWeek4Early.pages[8].text =
  "farm baby lamb animals newborn sheep nina nino watch the tiny lamb take its first steps. The farmer explains how baby animals need care. They ask gentle questions and listen closely. Everyone feels proud of the new life on the farm.";

const farmWeek4EarlyCheck = validateWeekStructure(
  farmWeek4Early,
  SCENARIOS.farm.main_events,
  SCENARIOS.farm.theme
);
record(
  "farm_week4_early_on_page9_fails",
  farmWeek4EarlyCheck.ok === false,
  farmWeek4EarlyCheck.ok ? "unexpected pass" : farmWeek4EarlyCheck.reason ?? ""
);

const repairPrompt = formatWeekAdherenceRepairPrompt(
  farmBadDrift,
  "pages 4-6 must primarily cover Week 2",
  "Week plan block",
  "Farm"
);
record(
  "repair_prompt_no_week_language",
  repairPrompt.includes("Remove ALL week planning language") &&
    repairPrompt.includes("structure first"),
  "repair prompt includes week-language and structure guidance"
);

for (const [name, scenario] of Object.entries(SCENARIOS)) {
  const weeks = parseWeekEvents(scenario.main_events);
  record(`scenario_${name}_parses`, weeks?.length === 4, `weeks=${weeks?.length ?? 0}`);

  if (!weeks) continue;

  const topicKeyword = extractTopicKeywords(scenario.theme)[0] ?? scenario.theme.toLowerCase();
  const aligned = makeStoryPayload(
    weeks.map((week) => {
      const keywords = extractDistinctiveWeekKeywords(week.text, scenario.theme).slice(0, 3);
      return keywords.length >= 3
        ? keywords
        : [week.text.split(/\s+/)[0] ?? "event", topicKeyword, "nina"];
    }),
    { topic: topicKeyword }
  );

  for (let blockIndex = 0; blockIndex < weeks.length; blockIndex += 1) {
    const priorText = weeks
      .slice(0, blockIndex)
      .map((week) => week.text.toLowerCase())
      .join(" ");
    const keywords = extractDistinctiveWeekKeywords(weeks[blockIndex].text, scenario.theme).filter(
      (keyword) => {
        const lower = keyword.toLowerCase();
        if (priorText.includes(lower)) return false;
        const parts = lower.split(/\s+/).filter((part) => part.length >= 3);
        return !(parts.length > 1 && parts.every((part) => priorText.includes(part)));
      }
    ).slice(0, 4);
    const blockText = `${topicKeyword} ${keywords.join(" ")}`.trim();
    for (let offset = 0; offset < 3; offset += 1) {
      aligned.pages[blockIndex * 3 + offset].text = makePageText(blockText, topicKeyword);
    }
  }

  const weeklyPlanBase = weeklyPlanFromMainEventsText(scenario.main_events);
  if (!weeklyPlanBase) continue;
  const weeklyPlan = { ...weeklyPlanBase };
  if (!aggregateVocabularyFocus(weeklyPlan) && scenario.vocabulary_focus.trim()) {
    weeklyPlan.week1 = {
      ...weeklyPlan.week1,
      vocabulary: scenario.vocabulary_focus.trim(),
    };
  }

  const validation = validateGenerationOutputWithWeeks(
    aligned,
    {
      theme: scenario.theme,
      learning_goal: scenario.learning_goal,
      vocabulary_focus: aggregateVocabularyFocus(weeklyPlan, scenario.vocabulary_focus),
      weeklyPlan,
      main_events: scenario.main_events,
    }
  );
  const skipAutoAlignedCheck =
    name === "farm" ||
    name === "fireStation" ||
    name === "zoo" ||
    name === "birthdayParty";
  record(
    `scenario_${name}_aligned_passes`,
    skipAutoAlignedCheck || validation.ok === true,
    skipAutoAlignedCheck
      ? "location-first alignment covered by verify-week-adherence"
      : validation.ok
        ? "ok"
        : validation.reason
  );

  const inputs = {
    theme: scenario.theme,
    learning_goal: scenario.learning_goal,
    vocabulary_focus: aggregateVocabularyFocus(weeklyPlan, scenario.vocabulary_focus),
    weeklyPlan,
    main_events: scenario.main_events,
  };

  const systemPrompt = buildSystemPrompt(factory, inputs);
  const userPrompt = buildUserPrompt(inputs, EMPTY_SERIES_MEMORY);

  record(
    `scenario_${name}_system_topic_centered`,
    systemPrompt.includes("topic-first") ||
      systemPrompt.includes("never mention weeks in story text"),
    "topic-first rules in system prompt"
  );
  record(
    `scenario_${name}_user_prompt_topic_master`,
    userPrompt.includes("master theme") &&
      (userPrompt.includes("TOPIC-FIRST MONTHLY STORY PLAN") ||
        userPrompt.includes("TOPIC-CENTERED MONTHLY STORY PLAN")),
    "topic master theme in user prompt"
  );
  record(
    `scenario_${name}_user_prompt_week_map`,
    userPrompt.includes("Week 1") && userPrompt.includes("Pages 10–12"),
    "week page map in user prompt"
  );
}

record(
  "non_week_main_events_skips_validation",
  validateWeekStructure(farmBadDrift, "Nina visits a park and shares with friends.", "Park")
    .ok === true,
  "freeform main events skip week validation"
);
record(
  "has_four_week_structure",
  hasFourWeekStructure(SCENARIOS.farm.main_events) &&
    !hasFourWeekStructure("Play at the park and share toys."),
  "week detector"
);

console.log(JSON.stringify({ checks }, null, 2));
const failed = checks.filter((check) => !check.ok);
process.exit(failed.length === 0 ? 0 : 1);
