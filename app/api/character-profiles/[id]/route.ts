import { NextResponse } from "next/server";
import { CHARACTER_PROFILE_API_COLUMNS } from "@/lib/character-profiles/api-types";
import { isOfficialCharacterKey } from "@/lib/character-profiles/factory-defaults";
import { validateEditableProfileFields } from "@/lib/character-profiles/validate-editable-fields";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id: characterKey } = await context.params;

  if (!isOfficialCharacterKey(characterKey)) {
    return NextResponse.json({ error: "Unknown character" }, { status: 400 });
  }

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

  const validated = validateEditableProfileFields(
    body.appearance_description,
    body.personality_description
  );

  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("character_profiles")
    .update({
      appearance_description: validated.appearance,
      personality_description: validated.personality,
      updated_at: now,
    })
    .eq("character_key", characterKey)
    .select(CHARACTER_PROFILE_API_COLUMNS)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Character profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile: data });
}
