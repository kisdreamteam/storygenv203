import { NextResponse } from "next/server";
import {
  CHARACTER_PROFILE_API_COLUMNS,
  sortProfilesByOfficialOrder,
} from "@/lib/character-profiles/api-types";
import { isOfficialCharacterKey } from "@/lib/character-profiles/factory-defaults";
import { OFFICIAL_CHARACTER_KEYS } from "@/lib/character-profiles/types";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    const text = await request.text();
    if (text.trim()) {
      body = JSON.parse(text) as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const characterKey =
    typeof body.character_key === "string" ? body.character_key.trim() : undefined;

  if (characterKey && !isOfficialCharacterKey(characterKey)) {
    return NextResponse.json({ error: "Unknown character" }, { status: 400 });
  }

  const keysToReset = characterKey ? [characterKey] : [...OFFICIAL_CHARACTER_KEYS];

  const { data: rows, error: loadError } = await supabase
    .from("character_profiles")
    .select("character_key, factory_appearance, factory_personality")
    .in("character_key", keysToReset);

  if (loadError) {
    return NextResponse.json({ error: "Failed to load character profiles" }, { status: 500 });
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "Character profile not found" }, { status: 404 });
  }

  const now = new Date().toISOString();

  for (const row of rows) {
    const { error: updateError } = await supabase
      .from("character_profiles")
      .update({
        appearance_description: row.factory_appearance,
        personality_description: row.factory_personality,
        updated_at: now,
      })
      .eq("character_key", row.character_key);

    if (updateError) {
      return NextResponse.json({ error: "Failed to reset character profiles" }, { status: 500 });
    }
  }

  const { data: profiles, error: listError } = await supabase
    .from("character_profiles")
    .select(CHARACTER_PROFILE_API_COLUMNS);

  if (listError) {
    return NextResponse.json({ error: "Failed to load character profiles" }, { status: 500 });
  }

  return NextResponse.json({ profiles: sortProfilesByOfficialOrder(profiles ?? []) });
}
