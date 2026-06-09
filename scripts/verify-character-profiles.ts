/**
 * Verify character profile resolver layer and story prompt integration.
 * Run: npm run verify:character-profiles
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  buildCharacterContinuityMap,
  formatOfficialCharacterProfilesForStory,
  getFactoryCharacterProfiles,
  loadCharacterProfiles,
  OFFICIAL_CHARACTER_KEYS,
  resolveCharacterProfilesMap,
} from "@/lib/character-profiles";
import {
  buildIllustrationPrompt,
  getCharacterContinuityText,
  GLOBAL_ILLUSTRATION_SUFFIX,
  injectIllustrationContinuityIntoPages,
} from "@/lib/generation/character-continuity";
import { buildSystemPrompt } from "@/lib/generation/prompts";

function loadEnv() {
  const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8").replace(/^\uFEFF/, "");
  const env: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

const OFFICIAL_KEYS = OFFICIAL_CHARACTER_KEYS;

const checks: { name: string; ok: boolean; detail?: string }[] = [];
function record(name: string, ok: boolean, detail = "") {
  checks.push({ name, ok, detail });
}

const factory = getFactoryCharacterProfiles();

record(
  "factory_profile_count",
  Object.keys(factory).length === 6,
  `count=${Object.keys(factory).length}`
);

for (const key of OFFICIAL_KEYS) {
  const profile = factory[key];
  record(
    `factory_key_${key}`,
    !!profile &&
      profile.appearanceDescription.trim().length > 0 &&
      profile.personalityDescription.trim().length > 0,
    profile ? "populated" : "missing"
  );
}

const nullResolved = resolveCharacterProfilesMap(null);
record(
  "fallback_null_rows",
  nullResolved.fallbackKeys.length === 6,
  `fallback=${nullResolved.fallbackKeys.length}`
);

const emptyResolved = resolveCharacterProfilesMap([]);
record(
  "fallback_empty_rows",
  emptyResolved.fallbackKeys.length === 6,
  `fallback=${emptyResolved.fallbackKeys.length}`
);

const invalidResolved = resolveCharacterProfilesMap([
  {
    character_key: "nina",
    display_name: "Nina",
    role: "Older sister",
    appearance_description: "",
    personality_description: "",
    factory_appearance: "x",
    factory_personality: "y",
    is_official: true,
  },
]);
record(
  "fallback_invalid_nina",
  invalidResolved.fallbackKeys.includes("nina"),
  invalidResolved.fallbackKeys.join(", ")
);

record(
  "resolved_map_has_six_keys",
  OFFICIAL_KEYS.every((k) => nullResolved.profiles[k]),
  `keys=${Object.keys(nullResolved.profiles).length}`
);

const formatted = formatOfficialCharacterProfilesForStory(factory);
record(
  "story_prompt_formatter_header",
  formatted.includes("OFFICIAL CHARACTER PROFILES:"),
  "header present"
);
record(
  "story_prompt_formatter_six_characters",
  OFFICIAL_KEYS.every((key) => formatted.includes(factory[key].displayName)),
  "all display names"
);

const systemPrompt = buildSystemPrompt(factory);
record(
  "build_system_prompt_factory_nina",
  systemPrompt.includes(factory.nina.appearanceDescription),
  "Nina factory appearance in prompt"
);
record(
  "build_system_prompt_official_profiles_section",
  systemPrompt.includes("OFFICIAL CHARACTER PROFILES:"),
  "profiles section in system prompt"
);

const customAppearance = "wears a blue friendship bracelet for verification";
const modifiedProfiles = {
  ...factory,
  nina: {
    ...factory.nina,
    appearanceDescription: `${factory.nina.appearanceDescription}; ${customAppearance}`,
  },
};
record(
  "build_system_prompt_modified_profile",
  buildSystemPrompt(modifiedProfiles).includes(customAppearance),
  "modified Nina appearance in prompt"
);

const continuityMap = buildCharacterContinuityMap(factory);
record(
  "illustration_continuity_map_six",
  OFFICIAL_KEYS.every((key) => continuityMap[key]?.includes(factory[key].displayName)),
  `keys=${Object.keys(continuityMap).length}`
);

const ninaPageText = "Nina and Nino share a ball at school.";
const ninaContinuity = getCharacterContinuityText(ninaPageText, factory);
record(
  "illustration_continuity_factory_nina",
  ninaContinuity.includes(factory.nina.appearanceDescription),
  "factory Nina appearance in continuity"
);
record(
  "illustration_continuity_modified_nina",
  getCharacterContinuityText(ninaPageText, modifiedProfiles).includes(customAppearance),
  "modified Nina appearance in continuity"
);

const samplePrompt = buildIllustrationPrompt({
  pageText: ninaPageText,
  pageNumber: 1,
  setting: "Sunny Grove Kindergarten",
  profiles: factory,
});
record(
  "illustration_prompt_global_suffix",
  samplePrompt.includes(GLOBAL_ILLUSTRATION_SUFFIX),
  "global suffix present"
);
record(
  "illustration_prompt_no_text_rules",
  samplePrompt.includes("no speech bubbles") && samplePrompt.includes("no text"),
  "no-text rules present"
);

const mockPages = Array.from({ length: 12 }, (_, i) => ({
  page_number: i + 1,
  text: i % 2 === 0 ? "Nina and Nino learn together." : "Mom and Dad smile.",
  illustration_prompt: "",
}));
const injected = injectIllustrationContinuityIntoPages(
  mockPages,
  "Sunny Grove Kindergarten",
  factory
);
record(
  "illustration_inject_twelve_pages",
  injected.length === 12 &&
    injected.every((p) => p.illustration_prompt.includes(GLOBAL_ILLUSTRATION_SUFFIX)),
  `count=${injected.length}`
);

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey && !serviceKey.includes("your-")) {
    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const loaded = await loadCharacterProfiles(admin);
    record("load_profiles_source", loaded.source === "database", loaded.source);
    record(
      "load_profiles_count",
      Object.keys(loaded.profiles).length === 6,
      `count=${Object.keys(loaded.profiles).length}`
    );

    for (const key of OFFICIAL_KEYS) {
      const p = loaded.profiles[key];
      record(
        `loaded_${key}_populated`,
        !!p?.appearanceDescription.trim() && !!p?.personalityDescription.trim(),
        loaded.warning ?? "ok"
      );
    }
  } else {
    record("load_profiles_db", true, "skipped — missing service credentials");
  }

  console.log(JSON.stringify({ checks }, null, 2));
  const failed = checks.filter((c) => !c.ok);
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
