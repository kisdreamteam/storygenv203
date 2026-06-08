/**
 * End-to-end workflow verification (auth + persistence + D9 memory).
 * Requires: .env.local, migration applied, teacher user exists.
 * Run: node scripts/verify-workflow.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const TEST_EMAIL = "teacher@storygen.test";
const TEST_PASSWORD = "StoryGenTest123!";

function loadEnv() {
  const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8").replace(/^\uFEFF/, "");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

function dedupeAppend(existing, items) {
  const result = [...existing];
  for (const item of items) {
    if (item && !result.includes(item)) result.push(item);
  }
  return result;
}

function mergeMemory(current, story, vocabularyWords) {
  const newEntry = {
    title: story.title,
    theme: story.theme,
    key_events: story.main_events.slice(0, 200),
    vocab: vocabularyWords,
    characters: ["Nina", "Nino"],
  };
  const recent = [...(current.recent_stories ?? []), newEntry].slice(-15);
  const setting = story.setting?.trim();
  return {
    characters: current.characters ?? [],
    settings: setting ? dedupeAppend(current.settings ?? [], [setting]) : current.settings ?? [],
    recent_stories: recent,
    vocabulary_history: dedupeAppend(current.vocabulary_history ?? [], vocabularyWords),
    themes_covered: dedupeAppend(current.themes_covered ?? [], [story.theme]),
    repetition_notes: current.repetition_notes ?? [],
  };
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const checks = [];
function record(name, ok, detail = "") {
  checks.push({ name, ok, detail });
}

const client = createClient(url, anonKey);
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: signIn, error: signInErr } = await client.auth.signInWithPassword({
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
});
record("auth_sign_in", !signInErr && !!signIn.session, signInErr?.message ?? signIn.user?.id ?? "");

if (!signIn.session) {
  console.log(JSON.stringify({ checks }, null, 2));
  process.exit(1);
}

const userId = signIn.user.id;
const authed = createClient(url, anonKey, {
  global: { headers: { Authorization: `Bearer ${signIn.session.access_token}` } },
});

const { data: memoryBefore, error: memBeforeErr } = await admin
  .from("series_memory")
  .select("summary")
  .eq("id", "nina-nino")
  .single();
record("series_memory_readable", !memBeforeErr && !!memoryBefore, memBeforeErr?.message ?? "");
const recentBefore = memoryBefore?.summary?.recent_stories?.length ?? 0;

const storyA = {
  created_by: userId,
  status: "draft",
  title: "Audit Story A",
  theme: "sharing",
  learning_goal: "learn to share",
  vocabulary_focus: "share, friend, help",
  main_events: "Nina and Nino share toys at the park.",
  setting: "Sunny Grove Kindergarten neighborhood",
};

const { data: story, error: storyErr } = await authed
  .from("stories")
  .insert(storyA)
  .select("id")
  .single();
record("create_story", !storyErr && !!story, storyErr?.message ?? story?.id ?? "");

if (!story) {
  console.log(JSON.stringify({ checks }, null, 2));
  process.exit(1);
}

const { error: pageErr } = await authed.from("story_pages").insert({
  story_id: story.id,
  page_number: 1,
  text: "Nina and Nino share a ball at the park.",
  illustration_prompt: "Park scene with Nina and Nino.",
});
record("insert_page", !pageErr, pageErr?.message ?? "");

const vocabWords = ["share", "friend", "help"];
const { error: vocabErr } = await authed.from("story_vocabulary").insert(
  vocabWords.map((word, i) => ({
    story_id: story.id,
    word,
    definition_or_example: `${word} example`,
    sort_order: i + 1,
  }))
);
record("insert_vocabulary", !vocabErr, vocabErr?.message ?? "");

const { error: editErr } = await authed
  .from("story_pages")
  .update({ text: "Edited: Nina and Nino share a ball at the park." })
  .eq("story_id", story.id)
  .eq("page_number", 1);
record("edit_page", !editErr, editErr?.message ?? "");

const { data: pageAfterEdit } = await authed
  .from("story_pages")
  .select("text")
  .eq("story_id", story.id)
  .eq("page_number", 1)
  .single();
record(
  "edit_persists",
  pageAfterEdit?.text?.startsWith("Edited:"),
  pageAfterEdit?.text?.slice(0, 40) ?? ""
);

const { error: saveErr } = await authed
  .from("stories")
  .update({ status: "saved", saved_at: new Date().toISOString() })
  .eq("id", story.id);
record("save_story", !saveErr, saveErr?.message ?? "");

const merged = mergeMemory(memoryBefore.summary, storyA, vocabWords);
const { error: memUpdateErr } = await admin
  .from("series_memory")
  .update({ summary: merged, updated_at: new Date().toISOString() })
  .eq("id", "nina-nino");
record("d9_memory_update", !memUpdateErr, memUpdateErr?.message ?? "");

const { data: memoryAfter } = await admin
  .from("series_memory")
  .select("summary")
  .eq("id", "nina-nino")
  .single();
const recentAfter = memoryAfter?.summary?.recent_stories?.length ?? 0;
const lastRecentTheme = memoryAfter?.summary?.recent_stories?.at(-1)?.theme ?? "";
record(
  "d9_recent_stories_grew",
  recentAfter > recentBefore || lastRecentTheme === "sharing",
  `${recentBefore} -> ${recentAfter} (last theme: ${lastRecentTheme || "none"})`
);

const priorTheme = memoryAfter?.summary?.recent_stories?.at(-1)?.theme ?? "";
const callbackText = `Nina and Nino remember ${priorTheme}`;
record(
  "d9_continuity_callback_ready",
  priorTheme === "sharing",
  `callback would use: "${callbackText}"`
);

const { data: savedList } = await authed
  .from("stories")
  .select("id")
  .eq("status", "saved")
  .eq("id", story.id);
record("saved_list_includes_story", (savedList?.length ?? 0) === 1, savedList?.[0]?.id ?? "");

const { data: draftList } = await authed
  .from("stories")
  .select("id")
  .eq("status", "draft");
record(
  "home_draft_excluded",
  !draftList?.some((d) => d.id === story.id),
  `saved story not in draft query`
);

console.log(JSON.stringify({ checks, storyId: story.id }, null, 2));
const failed = checks.filter((c) => !c.ok);
process.exit(failed.length === 0 ? 0 : 1);
