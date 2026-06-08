# Workflow Validation Metrics

Version: 1.0

Purpose: Explain lightweight pilot instrumentation for teacher workflow validation. **Not product analytics.**

Related: [teacher-pilot-test-plan.md](teacher-pilot-test-plan.md)

---

## What this is

During teacher pilots, the app writes **console-only** events prefixed with `[StoryGen:pilot]`. Facilitators open browser DevTools (F12 → Console) to observe timing and step completion during a session.

**This is not:**

- PostHog, Mixpanel, or any analytics provider
- Database logging or user tracking
- Cookies or cross-session identity
- A dashboard or background job

**This is:**

- Validation instrumentation only — not product analytics
- Evidence to answer workflow questions before changing the product again

---

## Events tracked

| Event | When it fires | Example detail |
|-------|----------------|----------------|
| `story_create_page_opened` | Teacher lands on `/stories/new` | `at`, `ts` |
| `story_generate_clicked` | Teacher clicks Generate | `generateCountBefore` |
| `story_generate_completed` | Generate API succeeds | `storyId`, `durationMs`, `generateCount` |
| `story_save_clicked` | Teacher clicks Save story (edit commit — not required after first Generate) | `storyId`, `saveClickCount` |
| `story_save_completed` | Save API succeeds (commits teacher edits + Series Memory) | `storyId`, `saveCompleteCount` |
| `story_page_opened` | Story viewer opened **first time** this session for that id | `storyId`, `status` |
| `story_reopened` | Same story id viewed again in session (e.g. from home) | `storyId`, `status` |
| `second_story_created` | Second successful generate in same browser session | `storyId`, `generateCount` |

Implementation: [`lib/validation/workflow-log.ts`](../lib/validation/workflow-log.ts)

---

## Questions each event answers

| Pilot question | How to use events |
|----------------|-------------------|
| How long does first story creation take? | `story_generate_clicked` → `story_generate_completed` — use `durationMs` on completed (API wait only). Facilitator also notes typing time before click. |
| Which steps cause hesitation? | Gaps between events + facilitator observer notes (not auto-detected). |
| Where do teachers abandon? | Last `[StoryGen:pilot]` event before session stops; missing `story_generate_completed` or missing edit-commit save after edits. |
| How often do teachers commit edits? | Count `story_save_clicked` / `story_save_completed` per session (only expected after edits). |
| How often are second stories created? | Look for `second_story_created` or `generateCount: 2` on `story_generate_completed`. |

---

## What metrics actually matter

For V1 pilot validation (per [source-of-truth.md](../source-of-truth.md)):

1. **Time to first draft** — soft target ~2 minutes total; `durationMs` covers generate wait only (~2s mock). Story is auto-saved on generate.
2. **Edit commit rate** — if the teacher edited, did they click Save story? (`story_save_completed` after edits)
3. **Reopen success** — `story_reopened` after generate (story is on home list without manual save)
4. **Second story completion** — `second_story_created` present
5. **Hesitation** — human observation; console gaps are hints only

Do **not** optimize for page views, DAU, or funnel conversion. This pilot validates **workflow clarity and speed**, not growth.

---

## How facilitators should record observations

1. Open DevTools Console before the teacher starts (filter: `StoryGen:pilot`).
2. Run the scenario in [teacher-pilot-test-plan.md](teacher-pilot-test-plan.md).
3. Note:
   - `durationMs` on first `story_generate_completed`
   - Whether `story_save_completed` appears
   - Whether `story_reopened` appears
   - Whether `second_story_created` appears
4. Copy console lines or screenshot for the session log.
5. Combine with observer checklist and feedback questions in the pilot doc.

**Optional manual fields:** sign-in time, first Generate click time, save time (wall clock).

---

## Scope guard

- Do not treat console logs as production telemetry.
- Do not add analytics SDKs without a new architecture decision.
- Remove or gate this instrumentation after pilot if no longer needed.
- Compare any workflow change request against [v1-scope.md](../v1-scope.md): *Does this reduce time-to-first-story?*

---

*End of workflow validation metrics doc.*
