/**
 * One-off Supabase connectivity check (no secrets logged).
 * Run: node scripts/verify-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  const text = readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const checks = [];

function record(name, ok, detail = "") {
  checks.push({ name, ok, detail });
}

if (!url || url.includes("your-project")) {
  record("env_url", false, "placeholder or missing");
} else if (url.includes("/rest/v1")) {
  record("env_url", false, "URL must not include /rest/v1");
} else {
  record("env_url", true);
}

record("env_anon", !!(anonKey && !anonKey.includes("your-")));
record("env_service", !!(serviceKey && !serviceKey.includes("your-")));

if (url && serviceKey && !serviceKey.includes("your-")) {
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const table of ["stories", "story_pages", "story_vocabulary", "series_memory"]) {
    const { error } = await admin.from(table).select("id").limit(1);
    record(`table_${table}`, !error, error?.message ?? "readable");
  }

  const { data: memory, error: memErr } = await admin
    .from("series_memory")
    .select("id, summary")
    .eq("id", "nina-nino")
    .maybeSingle();

  record("series_memory_seed", !memErr && !!memory, memErr?.message ?? (memory ? "found" : "missing row"));
  if (memory?.summary) {
    record(
      "series_memory_shape",
      Array.isArray(memory.summary.recent_stories),
      `recent_stories is array`
    );
  }
}

console.log(JSON.stringify({ checks }, null, 2));
const failed = checks.filter((c) => !c.ok);
process.exit(failed.length === 0 ? 0 : 1);
