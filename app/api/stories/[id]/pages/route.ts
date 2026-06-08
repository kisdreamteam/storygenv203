import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function verifyStoryPageAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storyId: string,
  pageId: string,
  userId: string
) {
  const { data: story } = await supabase
    .from("stories")
    .select("id")
    .eq("id", storyId)
    .eq("created_by", userId)
    .eq("is_archived", false)
    .single();

  if (!story) {
    return { ok: false as const, status: 404, error: "Story not found" };
  }

  const { data: page } = await supabase
    .from("story_pages")
    .select("id")
    .eq("id", pageId)
    .eq("story_id", storyId)
    .single();

  if (!page) {
    return { ok: false as const, status: 404, error: "Page not found" };
  }

  return { ok: true as const };
}

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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const pageId = typeof body.page_id === "string" ? body.page_id : "";
  const textField = typeof body.text === "string" ? body.text : null;
  const promptField =
    typeof body.illustration_prompt === "string" ? body.illustration_prompt : null;
  const hasText = textField !== null;
  const hasPrompt = promptField !== null;
  const text = textField?.trim() ?? "";
  const illustrationPrompt = promptField?.trim() ?? "";

  if (!pageId) {
    return NextResponse.json({ error: "page_id is required" }, { status: 400 });
  }

  if (!hasText && !hasPrompt) {
    return NextResponse.json(
      { error: "At least one of text or illustration_prompt is required" },
      { status: 400 }
    );
  }

  if (hasText && !text) {
    return NextResponse.json({ error: "Page text cannot be empty" }, { status: 400 });
  }

  if (hasPrompt && !illustrationPrompt) {
    return NextResponse.json(
      { error: "Illustration prompt cannot be empty" },
      { status: 400 }
    );
  }

  const access = await verifyStoryPageAccess(supabase, storyId, pageId, user.id);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const updates: { text?: string; illustration_prompt?: string } = {};
  if (hasText) updates.text = text;
  if (hasPrompt) updates.illustration_prompt = illustrationPrompt;

  const { error: updateError } = await supabase
    .from("story_pages")
    .update(updates)
    .eq("id", pageId);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
