/**
 * Facilitator browser walkthrough (Playwright). One-off pre-pilot validation.
 * Run: node scripts/facilitator-walkthrough.mjs [baseUrl]
 */
import { chromium } from "playwright";

const BASE_URL = process.argv[2] ?? "https://storygenv203.vercel.app";
const EMAIL = "teacher@storygen.test";
const PASSWORD = "StoryGenTest123!";
const THEME1 = `pilot validation sharing ${Date.now()}`;
const THEME2 = `pilot validation kindness ${Date.now()}`;
const EDIT_MARKER = `FACILITATOR EDIT ${Date.now()}`;

const steps = [];
const uxNotes = [];

function step(num, name, ok, detail = "") {
  steps.push({ step: num, name, result: ok ? "PASS" : "FAIL", detail });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`Step ${num} [${mark}] ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let story1Title = "";
  let story1Url = "";
  let editedText = "";

  try {
    // 1 Login
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.fill("#email", EMAIL);
    await page.fill("#password", PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/stories`, { timeout: 15000 });
    const onHome = page.url() === `${BASE_URL}/stories`;
    step(1, "Login with provisioned teacher account", onHome, page.url());

    // 2 Generate
    await page.click('a[href="/stories/new"]');
    await page.waitForURL(`${BASE_URL}/stories/new`);
    await page.fill("#theme", THEME1);
    await page.fill("#learning_goal", "Students practice sharing and taking turns.");
    await page.fill("#vocabulary_focus", "share, turn, kind, help");
    await page.fill(
      "#main_events",
      "Nina and Nino play at the park, take turns on the slide, and help a friend."
    );
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/stories\/[0-9a-f-]+$/, { timeout: 30000 });
    story1Url = page.url();
    const pageHeadings = await page.locator('h3:has-text("Page ")').count();
    step(2, "Generate a 12-page story", pageHeadings === 12, `${pageHeadings} pages at ${story1Url}`);
    story1Title = await page.locator("h1").first().textContent();

    // 3 Save
    await page.click('button:has-text("Save story")');
    await page.waitForURL(`${BASE_URL}/stories`, { timeout: 15000 });
    const onHomeAfterSave = page.url() === `${BASE_URL}/stories`;
    const storyOnHome = await page.locator(`a[href="${new URL(story1Url).pathname}"]`).count();
    step(3, "Save story", onHomeAfterSave && storyOnHome > 0, story1Title?.trim() ?? "");

    // 4 Refresh and reopen
    await page.reload({ waitUntil: "networkidle" });
    await page.click(`a[href="${new URL(story1Url).pathname}"]`);
    await page.waitForURL(story1Url, { timeout: 15000 });
    const pagesAfterReopen = await page.locator('h3:has-text("Page ")').count();
    step(4, "Refresh and reopen story", pagesAfterReopen === 12, `${pagesAfterReopen} pages after reopen`);

    // 5 Edit page 1
    const page1Textarea = page.locator("textarea").first();
    const originalText = await page1Textarea.inputValue();
    editedText = `${EDIT_MARKER} ${originalText.slice(0, 80)}`;
    const patchPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/stories/") &&
        res.url().endsWith("/pages") &&
        res.request().method() === "PATCH" &&
        res.status() === 200,
      { timeout: 15000 }
    );
    await page1Textarea.fill(editedText);
    await page1Textarea.blur();
    const patchRes = await patchPromise;
    const patchBody = await patchRes.json();
    await page.locator("span.text-green-700", { hasText: "Saved" }).waitFor({
      timeout: 5000,
    });
    await page.reload({ waitUntil: "networkidle" });
    const textAfterRefresh = await page.locator("textarea").first().inputValue();
    const editPersisted = textAfterRefresh.includes(EDIT_MARKER);
    step(
      5,
      "Edit one page text and confirm save",
      editPersisted && patchBody?.success === true,
      editPersisted ? `PATCH ok; edit survived refresh` : textAfterRefresh.slice(0, 60)
    );

    // 6 Regenerate
    page.once("dialog", (dialog) => dialog.accept());
    const regenPromise = page.waitForResponse(
      (res) => res.url().includes("/regenerate") && res.request().method() === "POST",
      { timeout: 30000 }
    );
    await page.click('button:has-text("Regenerate")');
    const regenRes = await regenPromise;
    const regenBody = await regenRes.json();
    await page.reload({ waitUntil: "networkidle" });
    const statusLabel = await page
      .locator("header span.rounded")
      .filter({ hasText: /^(Saved|Draft)$/ })
      .first()
      .textContent();
    const pagesAfterRegen = await page.locator('h3:has-text("Page ")').count();
    const regenOk =
      regenRes.status() === 200 &&
      regenBody?.success === true &&
      pagesAfterRegen === 12 &&
      statusLabel?.trim() === "Draft";
    if (!regenOk) {
      uxNotes.push(
        `Regenerate: HTTP ${regenRes.status()}, status="${statusLabel?.trim()}", pages=${pagesAfterRegen}`
      );
    }
    step(
      6,
      "Regenerate from edited inputs",
      regenOk,
      `status=${statusLabel?.trim()}, ${pagesAfterRegen} pages`
    );

    // 7 Save again
    await page.click('button:has-text("Save story")');
    await page.waitForURL(`${BASE_URL}/stories`, { timeout: 15000 });
    const storyBackOnHome = await page.locator(`a[href="${new URL(story1Url).pathname}"]`).count();
    step(7, "Save again", storyBackOnHome > 0, "story visible on home after re-save");

    // 8 Logout
    await page.click('button:has-text("Sign out")');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });
    step(8, "Logout", page.url() === `${BASE_URL}/` || page.url() === BASE_URL, page.url());

    // 9 Login again
    await page.fill("#email", EMAIL);
    await page.fill("#password", PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/stories`, { timeout: 15000 });
    step(9, "Login again", page.url() === `${BASE_URL}/stories`, page.url());

    // 10 Story still exists
    const storyStillThere = await page.locator(`a[href="${new URL(story1Url).pathname}"]`).count();
    step(10, "Confirm story still exists", storyStillThere > 0, story1Title?.trim() ?? "");

    // 11 Second story
    await page.click('a[href="/stories/new"]');
    await page.waitForURL(`${BASE_URL}/stories/new`);
    await page.fill("#theme", THEME2);
    await page.fill("#learning_goal", "Students learn kindness in the classroom.");
    await page.fill("#vocabulary_focus", "kind, friend, smile, help");
    await page.fill(
      "#main_events",
      "Nina and Nino help a classmate find a lost crayon and say kind words."
    );
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/stories\/[0-9a-f-]+$/, { timeout: 30000 });
    const story2Url = page.url();
    const story2Pages = await page.locator('h3:has-text("Page ")').count();
    step(11, "Create a second story", story2Pages === 12, story2Url);

    // 12 Continuity
    const page1Text = await page.locator("textarea").first().inputValue();
    const rememberPhrase = page1Text.toLowerCase().includes("remember");
    const referencesPrior =
      page1Text.toLowerCase().includes("sharing") ||
      page1Text.toLowerCase().includes(THEME1.split(" ")[2] ?? "sharing");
    const continuityOk = rememberPhrase && referencesPrior;
    if (!continuityOk) {
      uxNotes.push(`Second story page 1 did not show expected continuity. Text: ${page1Text.slice(0, 120)}`);
    }
    step(
      12,
      "Second story continuity-aware",
      continuityOk,
      page1Text.slice(0, 100)
    );
  } catch (err) {
    uxNotes.push(`Unhandled error: ${err.message}`);
    console.error(err);
  } finally {
    await browser.close();
  }

  const blockers = steps.filter((s) => s.result === "FAIL");
  const report = {
    baseUrl: BASE_URL,
    steps,
    blockers: blockers.map((s) => `Step ${s.step}: ${s.name} — ${s.detail}`),
    uxNotes,
    teacherPilotReady: blockers.length === 0,
  };

  console.log("\n=== REPORT ===");
  console.log(JSON.stringify(report, null, 2));
  process.exit(blockers.length === 0 ? 0 : 1);
}

main();
