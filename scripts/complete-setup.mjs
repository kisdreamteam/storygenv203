/**
 * Setup helper: verify env, ensure teacher exists, report migration status.
 * Run: node scripts/complete-setup.mjs
 */
import { spawnSync } from "child_process";
import { resolve } from "path";

function run(script) {
  const result = spawnSync("node", [resolve("scripts", script)], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  return { script, code: result.status ?? 1, stdout: result.stdout, stderr: result.stderr };
}

const verify = run("verify-supabase.mjs");
let parsed = { checks: [] };
try {
  parsed = JSON.parse(verify.stdout);
} catch {
  console.log(verify.stdout || verify.stderr);
}

const tablesOk = parsed.checks?.every((c) => c.name.startsWith("table_") && c.ok);

console.log("=== Supabase setup status ===\n");
console.log(verify.stdout);

if (!tablesOk) {
  console.log("\nACTION REQUIRED: Apply migration in Supabase SQL Editor:");
  console.log("  File: supabase/migrations/001_initial.sql");
  console.log("  Or:   add DATABASE_URL to .env.local and run node scripts/apply-migration.mjs\n");
}

const teacher = run("setup-teacher.mjs");
console.log("=== Teacher user ===\n");
console.log(teacher.stdout || teacher.stderr);

if (tablesOk) {
  const workflow = run("verify-workflow.mjs");
  console.log("=== Workflow verification ===\n");
  console.log(workflow.stdout || workflow.stderr);
  process.exit(workflow.code ?? 1);
}

process.exit(verify.code ?? 1);
