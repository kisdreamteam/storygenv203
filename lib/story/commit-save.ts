import type { SupabaseClient } from "@supabase/supabase-js";
import { updateSeriesMemoryOnSave } from "@/lib/series-memory/update";

export type CommitSaveResult =
  | { ok: true; warning: string | null }
  | { ok: false; error: string };

export async function commitStorySave(
  supabase: SupabaseClient,
  storyId: string,
  userId: string
): Promise<CommitSaveResult> {
  const { data: story, error: storyError } = await supabase
    .from("stories")
    .select("id, title, theme, main_events, setting")
    .eq("id", storyId)
    .eq("created_by", userId)
    .eq("is_archived", false)
    .single();

  if (storyError || !story) {
    return { ok: false, error: "Story not found" };
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
    return { ok: false, error: "Failed to save story" };
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

  return { ok: true, warning };
}

export function combineWarnings(
  ...parts: Array<string | null | undefined>
): string | null {
  const messages = parts.map((p) => p?.trim()).filter((p): p is string => !!p);
  return messages.length > 0 ? messages.join(" ") : null;
}
