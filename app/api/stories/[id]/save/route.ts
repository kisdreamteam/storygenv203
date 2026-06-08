import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { commitStorySave } from "@/lib/story/commit-save";

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

  const result = await commitStorySave(supabase, storyId, user.id);

  if (!result.ok) {
    const status = result.error === "Story not found" ? 404 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ success: true, warning: result.warning });
}
