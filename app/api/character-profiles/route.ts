import { NextResponse } from "next/server";
import {
  CHARACTER_PROFILE_API_COLUMNS,
  sortProfilesByOfficialOrder,
} from "@/lib/character-profiles/api-types";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("character_profiles")
    .select(CHARACTER_PROFILE_API_COLUMNS);

  if (error) {
    return NextResponse.json({ error: "Failed to load character profiles" }, { status: 500 });
  }

  return NextResponse.json({ profiles: sortProfilesByOfficialOrder(data ?? []) });
}
