import { NextResponse } from "next/server";
import { regeneratePageIllustrationPrompt } from "@/lib/generation/regenerate-page-prompt";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id: storyId } = await context.params;
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

  const pageId = typeof body.page_id === "string" ? body.page_id : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!pageId) {
    return NextResponse.json({ error: "page_id is required" }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: "Page text cannot be empty" }, { status: 400 });
  }

  const { data: story } = await supabase
    .from("stories")
    .select("id, theme, setting")
    .eq("id", storyId)
    .eq("created_by", user.id)
    .eq("is_archived", false)
    .single();

  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const { data: page } = await supabase
    .from("story_pages")
    .select("id, page_number")
    .eq("id", pageId)
    .eq("story_id", storyId)
    .single();

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const { illustration_prompt, warning } = await regeneratePageIllustrationPrompt({
    pageText: text,
    pageNumber: page.page_number,
    setting: story.setting,
    theme: story.theme,
  });

  const { error: updateError } = await supabase
    .from("story_pages")
    .update({ text, illustration_prompt })
    .eq("id", pageId);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update page prompt" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    text,
    illustration_prompt,
    warning: warning ?? undefined,
  });
}
