/**
 * Create invite-only teacher user via service role (if not exists).
 * Run: node scripts/setup-teacher.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const TEST_EMAIL = "teacher@storygen.test";
const TEST_PASSWORD = "StoryGenTest123!";

function loadEnv() {
  const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8").replace(/^\uFEFF/, "");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
const existing = list?.users?.find((u) => u.email === TEST_EMAIL);

if (existing) {
  console.log(JSON.stringify({ ok: true, action: "exists", userId: existing.id, email: TEST_EMAIL }));
  process.exit(0);
}

const { data, error } = await admin.auth.admin.createUser({
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
  email_confirm: true,
});

if (error) {
  console.log(JSON.stringify({ ok: false, error: error.message }));
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    action: "created",
    userId: data.user?.id,
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })
);
