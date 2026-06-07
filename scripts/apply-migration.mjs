/**
 * Apply 001_initial.sql via DATABASE_URL or Supabase Management API token.
 * Run: node scripts/apply-migration.mjs
 */
import pg from "pg";
import { readFileSync } from "fs";
import { resolve } from "path";

const { Client } = pg;
const PROJECT_REF = "tjzfzrsuqmpkiamlnbhx";

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
const migrationArg = process.argv[2];
const migrationPath = migrationArg
  ? resolve(process.cwd(), migrationArg)
  : resolve(process.cwd(), "supabase/migrations/001_initial.sql");
const sql = readFileSync(migrationPath, "utf8");

async function applyViaPg(databaseUrl) {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query(sql);
  await client.end();
}

async function applyViaManagementApi(token) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql, read_only: false }),
    }
  );
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Management API ${res.status}: ${body.slice(0, 200)}`);
  }
}

try {
  if (env.DATABASE_URL && !env.DATABASE_URL.includes("your-")) {
    await applyViaPg(env.DATABASE_URL);
    console.log(JSON.stringify({ ok: true, method: "DATABASE_URL" }));
    process.exit(0);
  }

  const token = env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_ACCESS_TOKEN;
  if (token) {
    await applyViaManagementApi(token);
    console.log(JSON.stringify({ ok: true, method: "SUPABASE_ACCESS_TOKEN" }));
    process.exit(0);
  }

  console.log(
    JSON.stringify({
      ok: false,
      error:
        "Set DATABASE_URL or SUPABASE_ACCESS_TOKEN in .env.local, or paste supabase/migrations/001_initial.sql into the Supabase SQL Editor and Run.",
    })
  );
  process.exit(1);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("already exists")) {
    console.log(JSON.stringify({ ok: true, message: "Migration already applied" }));
    process.exit(0);
  }
  console.log(JSON.stringify({ ok: false, error: message }));
  process.exit(1);
}
