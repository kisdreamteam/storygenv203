import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { suggestWeeklyPlan } from "@/lib/generation/suggest-weekly-plan";
import { validateStoryInputs } from "@/lib/story/validate-inputs";

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

  const validated = validateStoryInputs(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const replaceAll = body.replaceAll === true;

  const result = await suggestWeeklyPlan(validated, { replaceAll });
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 422 });
  }

  return NextResponse.json({ weeklyPlan: result.weeklyPlan });
}
