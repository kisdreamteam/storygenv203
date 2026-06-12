import { NextResponse } from "next/server";
import { rebuildSeriesMemoryFromActiveStories } from "@/lib/series-memory/update";
import { createClient } from "@/lib/supabase/server";

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
    .select("id")
    .eq("id", storyId)
    .eq("created_by", user.id)
    .eq("is_archived", false)
    .single();

  if (storyError || !story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("stories")
    .update({
      is_archived: true,
      updated_at: now,
    })
    .eq("id", storyId);

  if (updateError) {
    return NextResponse.json({ error: "Failed to archive story" }, { status: 500 });
  }

  const { warning } = await rebuildSeriesMemoryFromActiveStories();

  return NextResponse.json({ success: true, warning });
}
