import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStory } from "@/lib/generation/pipeline";
import { combineWarnings, commitStorySave } from "@/lib/story/commit-save";
import { validateGenerateStoryInputs } from "@/lib/story/validate-inputs";
import { resolvePersistedWeeklyPlan } from "@/lib/story/weekly-plan";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = validateGenerateStoryInputs(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const inputs = validated;

  let generation;
  try {
    generation = await generateStory(supabase, inputs);
  } catch {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }

  if (!generation.ok) {
    return NextResponse.json({ error: generation.error }, { status: 422 });
  }

  const { result, warning: generationWarning } = generation;

  const persisted = resolvePersistedWeeklyPlan(
    inputs.weeklyPlan,
    result.inferred_weekly_plan,
    inputs.theme,
    inputs.vocabulary_focus
  );

  const { data: story, error: storyError } = await supabase
    .from("stories")
    .insert({
      created_by: user.id,
      status: "draft",
      title: result.story.title,
      theme: inputs.theme,
      learning_goal: inputs.learning_goal,
      vocabulary_focus: persisted.vocabulary_focus,
      main_events: persisted.main_events,
      weekly_plan: persisted.weeklyPlan,
      setting: inputs.setting ?? null,
      tone: inputs.tone ?? null,
      words_to_avoid: inputs.words_to_avoid ?? null,
      notes: inputs.notes ?? null,
    })
    .select("id")
    .single();

  if (storyError || !story) {
    return NextResponse.json({ error: "Failed to save story" }, { status: 500 });
  }

  const { error: pagesError } = await supabase.from("story_pages").insert(
    result.pages.map((page) => ({
      story_id: story.id,
      page_number: page.page_number,
      text: page.text,
      illustration_prompt: page.illustration_prompt,
    }))
  );

  if (pagesError) {
    await supabase.from("stories").delete().eq("id", story.id);
    return NextResponse.json({ error: "Failed to save story pages" }, { status: 500 });
  }

  const { error: vocabError } = await supabase.from("story_vocabulary").insert(
    result.vocabulary.map((item) => ({
      story_id: story.id,
      word: item.word,
      definition_or_example: item.definition_or_example,
      sort_order: item.sort_order,
    }))
  );

  if (vocabError) {
    await supabase.from("story_pages").delete().eq("story_id", story.id);
    await supabase.from("stories").delete().eq("id", story.id);
    return NextResponse.json({ error: "Failed to save vocabulary" }, { status: 500 });
  }

  const saveResult = await commitStorySave(supabase, story.id, user.id);
  if (!saveResult.ok) {
    return NextResponse.json({ error: saveResult.error }, { status: 500 });
  }

  return NextResponse.json({
    storyId: story.id,
    warning: combineWarnings(generationWarning, saveResult.warning),
  });
}
