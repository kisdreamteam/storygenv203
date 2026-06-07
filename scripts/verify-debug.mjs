/**
 * Replicates /debug/supabase checks without a browser.
 * Run: node scripts/verify-debug.mjs
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

function yesNo(value) {
  return value && value.trim() !== "" ? "yes" : "no";
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const report = {
  framework: "Next.js (App Router)",
  supabaseUrlPresent: yesNo(url),
  urlFormatValid: url && !url.includes("/rest/v1") ? "yes" : "no",
  anonKeyPresent: yesNo(anonKey),
  serviceRolePresent: yesNo(serviceKey),
  sessionPresent: "no",
  userId: null,
  authError: null,
  databaseReadTest: "skipped",
  databaseDetail: "",
};

const client = createClient(url, anonKey);
const { data: signIn, error: signInErr } = await client.auth.signInWithPassword({
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
});

if (signInErr) {
  report.authError = signInErr.message;
} else if (signIn.session) {
  report.sessionPresent = "yes";
  report.userId = signIn.user.id;

  const authed = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${signIn.session.access_token}` } },
  });

  const { data, error } = await authed
    .from("series_memory")
    .select("id")
    .eq("id", "nina-nino")
    .maybeSingle();

  if (error) {
    report.databaseReadTest = "error";
    report.databaseDetail = error.message;
  } else if (data) {
    report.databaseReadTest = "ok";
    report.databaseDetail = "series_memory row readable";
  } else {
    report.databaseReadTest = "missing row";
    report.databaseDetail = "series_memory id nina-nino not found";
  }
}

console.log(JSON.stringify(report, null, 2));

const ok =
  report.supabaseUrlPresent === "yes" &&
  report.urlFormatValid === "yes" &&
  report.anonKeyPresent === "yes" &&
  report.serviceRolePresent === "yes" &&
  report.sessionPresent === "yes" &&
  report.databaseReadTest === "ok";

process.exit(ok ? 0 : 1);
