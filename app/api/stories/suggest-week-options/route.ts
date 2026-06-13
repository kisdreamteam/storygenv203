import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { suggestWeekOptions } from "@/lib/generation/suggest-week-options";
import { hasRequiredProtagonist, normalizeCharacterHints } from "@/lib/story/character-hints";
import { normalizeWeeklyPlan } from "@/lib/story/weekly-plan";

function optionalField(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function parseWeekNumber(value: unknown): 1 | 2 | 3 | 4 | null {
  const week = typeof value === "number" ? value : Number(value);
  if (week === 1 || week === 2 || week === 3 || week === 4) return week;
  return null;
}

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

  const theme = typeof body.theme === "string" ? body.theme.trim() : "";
  if (!theme) {
    return NextResponse.json({ error: "Missing required field: theme is required." }, { status: 400 });
  }

  const characterHints = normalizeCharacterHints(body.characterHints);
  if (!hasRequiredProtagonist(characterHints)) {
    return NextResponse.json(
      { error: "Select at least Nina or Nino before suggesting week options." },
      { status: 400 }
    );
  }

  const week = parseWeekNumber(body.week);
  if (!week) {
    return NextResponse.json({ error: "Week must be 1, 2, 3, or 4." }, { status: 400 });
  }

  const priorWeeksRaw = body.priorWeeks;
  const priorWeeks =
    priorWeeksRaw !== undefined ? normalizeWeeklyPlan(priorWeeksRaw) : undefined;

  const result = await suggestWeekOptions({
    theme,
    learning_goal: typeof body.learning_goal === "string" ? body.learning_goal.trim() : "",
    characterHints,
    week,
    priorWeeks,
    setting: optionalField(body.setting),
    tone: optionalField(body.tone),
    notes: optionalField(body.notes),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 422 });
  }

  return NextResponse.json({ options: result.options });
}
