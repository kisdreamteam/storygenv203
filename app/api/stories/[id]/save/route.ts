import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateSeriesMemoryOnSave } from "@/lib/series-memory/update";

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
    .select("id, title, theme, main_events, setting")
    .eq("id", storyId)
    .eq("created_by", user.id)
    .single();

  if (storyError || !story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const { data: vocabulary } = await supabase
    .from("story_vocabulary")
    .select("word")
    .eq("story_id", storyId)
    .order("sort_order", { ascending: true });

  const vocabularyWords = (vocabulary ?? []).map((item) => item.word);

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("stories")
    .update({
      status: "saved",
      saved_at: now,
      updated_at: now,
    })
    .eq("id", storyId);

  if (updateError) {
    return NextResponse.json({ error: "Failed to save story" }, { status: 500 });
  }

  const { warning } = await updateSeriesMemoryOnSave(
    {
      title: story.title,
      theme: story.theme,
      main_events: story.main_events,
      setting: story.setting,
    },
    vocabularyWords
  );

  return NextResponse.json({ success: true, warning });
}
