import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStory } from "@/lib/generation/pipeline";
import type { StoryInputs } from "@/lib/generation/types";
import { combineWarnings, commitStorySave } from "@/lib/story/commit-save";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id: storyId } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: story, error: storyError } = await supabase
    .from("stories")
    .select(
      "id, status, theme, learning_goal, vocabulary_focus, main_events, setting, tone, words_to_avoid, notes"
    )
    .eq("id", storyId)
    .eq("created_by", user.id)
    .eq("is_archived", false)
    .single();

  if (storyError || !story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const inputs: StoryInputs = {
    theme: story.theme,
    learning_goal: story.learning_goal,
    vocabulary_focus: story.vocabulary_focus,
    main_events: story.main_events,
    setting: story.setting ?? undefined,
    tone: story.tone ?? undefined,
    words_to_avoid: story.words_to_avoid ?? undefined,
    notes: story.notes ?? undefined,
  };

  const { data: existingPages, error: pagesLoadError } = await supabase
    .from("story_pages")
    .select("page_number, text")
    .eq("story_id", storyId)
    .order("page_number");

  if (pagesLoadError) {
    return NextResponse.json({ error: "Failed to load story pages" }, { status: 500 });
  }

  let generation;
  try {
    generation = await generateStory(supabase, inputs, {
      mode: "regenerate",
      previousPages: existingPages ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Regeneration failed" }, { status: 500 });
  }

  const { result, warning: generationWarning } = generation;

  const { error: deleteVocabError } = await supabase
    .from("story_vocabulary")
    .delete()
    .eq("story_id", storyId);

  if (deleteVocabError) {
    return NextResponse.json({ error: "Failed to replace vocabulary" }, { status: 500 });
  }

  const { error: deletePagesError } = await supabase
    .from("story_pages")
    .delete()
    .eq("story_id", storyId);

  if (deletePagesError) {
    return NextResponse.json({ error: "Failed to replace pages" }, { status: 500 });
  }

  const { error: pagesError } = await supabase.from("story_pages").insert(
    result.pages.map((page) => ({
      story_id: storyId,
      page_number: page.page_number,
      text: page.text,
      illustration_prompt: page.illustration_prompt,
    }))
  );

  if (pagesError) {
    return NextResponse.json({ error: "Failed to save new pages" }, { status: 500 });
  }

  const { error: vocabError } = await supabase.from("story_vocabulary").insert(
    result.vocabulary.map((item) => ({
      story_id: storyId,
      word: item.word,
      definition_or_example: item.definition_or_example,
      sort_order: item.sort_order,
    }))
  );

  if (vocabError) {
    return NextResponse.json({ error: "Failed to save new vocabulary" }, { status: 500 });
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("stories")
    .update({
      title: result.story.title,
      updated_at: now,
    })
    .eq("id", storyId);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
  }

  const saveResult = await commitStorySave(supabase, storyId, user.id);
  if (!saveResult.ok) {
    return NextResponse.json({ error: saveResult.error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    warning: combineWarnings(generationWarning, saveResult.warning),
  });
}
