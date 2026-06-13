import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { truncateTitle } from "@/lib/story/truncate-title";
import { validateStoryInputs } from "@/lib/story/validate-inputs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = validateStoryInputs(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("stories")
    .update({
      title: truncateTitle(validated.theme),
      theme: validated.theme,
      learning_goal: validated.learning_goal,
      vocabulary_focus: validated.vocabulary_focus,
      main_events: validated.main_events,
      weekly_plan: validated.weeklyPlan,
      setting: validated.setting ?? null,
      tone: validated.tone ?? null,
      words_to_avoid: validated.words_to_avoid ?? null,
      notes: validated.notes ?? null,
      updated_at: now,
    })
    .eq("id", storyId);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update story setup" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
