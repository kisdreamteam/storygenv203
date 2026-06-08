# Workflow Validation Checklist

Version: 1.0

Purpose: Verify the complete V1 teacher workflow end-to-end **before** pilot sessions. Documentation only — not a spec change, not product analytics.

Authority: [product-spec.md](../product-spec.md), [source-of-truth.md](../source-of-truth.md), [v1-scope.md](../v1-scope.md), [docs/phase-b-architecture-map.md](phase-b-architecture-map.md)

Related:

- [pilot-session-checklist.md](pilot-session-checklist.md) — run during teacher sessions
- [teacher-pilot-test-plan.md](teacher-pilot-test-plan.md) — teacher scenario steps
- [workflow-validation-metrics.md](workflow-validation-metrics.md) — console events

---

## Scope

Validate these seven areas. **Do not add features or change architecture during validation.** Report failures before fixing.

| # | Area | V1 expectation |
|---|------|----------------|
| 1 | Sign-up / login / logout | Invite-only — **no public sign-up UI**; login + logout work |
| 2 | Story generation | Four required inputs → Generate → 12 pages + vocabulary + illustration prompts |
| 3 | Save / reopen persistence | Save → home list → reopen shows same content |
| 4 | Edit + regenerate | Page edit on blur persists; Regenerate replaces pages (saved → draft) |
| 5 | Supabase ownership + RLS | Teachers see only own stories; unauthenticated blocked |
| 6 | Refresh / browser close / return | Session cookie survives refresh; saved stories persist in Supabase |
| 7 | Build / deploy readiness | `npm run build` passes; env vars set on target environment |

---

## Prerequisites

Before running checks:

- [ ] `.env.local` configured (see [.env.local.example](../.env.local.example))
- [ ] Supabase migration applied (`supabase/migrations/001_initial.sql`, `002_stories_delete_policy.sql`)
- [ ] Teacher account provisioned (see §1 below)
- [ ] `npm install` completed
- [ ] Dev server running (`npm run dev`) for browser checks

---

## Automated checks (run first)

Run from repo root. All must pass before browser validation.

```bash
npm run verify:supabase    # env + tables + series_memory seed
npm run setup:teacher      # ensures test teacher exists (local dev)
npm run verify:workflow    # auth, CRUD, edit, save, series memory merge
npm run verify:debug       # session + DB read smoke test
npm run build              # production build + typecheck
```

| Script | What it proves |
|--------|----------------|
| `verify:supabase` | URL/keys valid; all four tables readable; `series_memory` singleton seeded |
| `setup:teacher` | Invite-only teacher account exists (`teacher@storygen.test` for local dev) |
| `verify:workflow` | Sign-in, story insert, page edit, save, home list filter, D9 memory update |
| `verify:debug` | Auth session + authenticated `series_memory` read |
| `build` | No compile/type errors; all V1 routes present |

**Record results** in the validation log at the bottom of this document.

---

## 1. Sign-up / login / logout

### By design (not a failure)

- Public sign-up is **disabled** per [drift-log.md](../drift-log.md) and architecture map.
- Teachers are provisioned by admin: Supabase dashboard **Authentication → Users → Add user**, or `npm run setup:teacher` for local dev.

### Local dev credentials (from `setup:teacher`)

| Field | Value |
|-------|-------|
| Email | `teacher@storygen.test` |
| Password | `StoryGenTest123!` |

Do **not** commit real teacher credentials to the repo.

### Browser checks

- [ ] Visit `/` unauthenticated → redirects to `/login`
- [ ] `/login` loads; invalid credentials show error message
- [ ] Valid credentials → redirect to `/` (home)
- [ ] Visit `/login` while signed in → redirect to `/`
- [ ] **Sign out** on home or story page → returns to `/login`
- [ ] After sign out, visit `/` → redirects to `/login`

### API checks (unauthenticated)

- [ ] `POST /api/stories/generate` → 401
- [ ] `POST /api/stories/{id}/save` → 401

---

## 2. Story generation

- [ ] Click **New Story** → `/stories/new` with four required fields visible
- [ ] Optional fields hidden under **More options**
- [ ] Submit with empty required fields → Generate disabled
- [ ] Fill Theme, Learning Goal, Vocabulary Focus, Main Events → **Generate** enabled
- [ ] Click **Generate** → redirect to `/stories/{id}`
- [ ] Story page shows **12 pages**, each with text + illustration prompt + copy button
- [ ] Vocabulary section populated (words from Vocabulary Focus)
- [ ] Status badge shows **Draft**
- [ ] Console: `[StoryGen:pilot] story_create_page_opened`, `story_generate_clicked`, `story_generate_completed`

**Prototype note:** Wording is mock/template — expected for V1 validation.

---

## 3. Save / reopen persistence

- [ ] On draft story page, click **Save story** → redirect to home
- [ ] Saved story appears in home list (title, theme, saved date)
- [ ] Draft-only stories **do not** appear on home before Save
- [ ] Click saved story card → reopens `/stories/{id}`
- [ ] All 12 pages and vocabulary match pre-save content
- [ ] Console: `story_save_clicked`, `story_save_completed`, then `story_reopened` on second open

---

## 4. Edit + regenerate

### Page edit

- [ ] Edit page 1 text; tab/click away (blur)
- [ ] “Saving…” then “Saved” feedback appears
- [ ] Refresh page → edited text persists
- [ ] Navigate home → reopen story → edited text still present

### Regenerate

- [ ] Click **Regenerate** → confirm dialog appears
- [ ] Confirm → pages and vocabulary replaced; page refreshes
- [ ] If story was **Saved**, status returns to **Draft** and story disappears from home until saved again
- [ ] Series Memory does **not** update on regenerate (only on Save)

---

## 5. Supabase ownership + RLS

Verified by migration policies in `supabase/migrations/001_initial.sql` and automated scripts.

| Check | Expected | How to verify |
|-------|----------|---------------|
| Unauthenticated read `stories` | Blocked (empty) | `verify:workflow` / anon client |
| Unauthenticated read `series_memory` | Blocked (empty) | anon client |
| Authenticated read `series_memory` | Allowed (read-only) | `verify:debug` |
| Teacher read own stories | Allowed | sign in + home list |
| Teacher read another user's story by URL | Not found | RLS filters select |
| Teacher update/delete another user's story | No effect | RLS (0 rows) |
| Teacher direct write `series_memory` | Blocked | no UPDATE policy; service role only via save API |
| `created_by` on insert | Set to `auth.uid()` | generate API |

- [ ] Facilitator confirms home list shows **only own** saved stories
- [ ] Optional: open another user's story UUID while signed in → “Story not found”

---

## 6. Refresh / browser close / return

- [ ] Sign in → refresh home → still signed in, list loads
- [ ] Open draft story → refresh → same story and pages load
- [ ] Close browser tab → reopen app URL → session persists (Supabase auth cookie)
- [ ] After browser close, saved stories still on home (Supabase persistence)
- [ ] Sign out → close tab → reopen → `/login` (no session)

**Note:** Middleware checks for auth cookie presence (`sb-*-auth-token`). Invalid/expired cookies may require re-login — acceptable for V1.

---

## 7. Pilot instrumentation

- [ ] DevTools Console filter `StoryGen:pilot` shows events during a full run
- [ ] `second_story_created` fires after second successful Generate in same session
- [ ] Second story page 1 references prior saved theme (Series Memory continuity)

See [workflow-validation-metrics.md](workflow-validation-metrics.md) for event definitions.

---

## Validation log

Fill in when running this checklist.

| Field | Value |
|-------|-------|
| Date | |
| Facilitator | |
| Environment | local / preview / production |
| `verify:supabase` | pass / fail |
| `verify:workflow` | pass / fail |
| `verify:debug` | pass / fail |
| `build` | pass / fail |
| Browser workflow (§2–4) | pass / fail |
| Session persistence (§6) | pass / fail |
| Blockers found | |
| Teacher testing ready? | yes / no |

---

## Latest automated validation (2026-06-08)

Run on local dev against configured Supabase project.

| Check | Result |
|-------|--------|
| `npm run verify:supabase` | **Pass** — all tables + seed OK |
| `npm run setup:teacher` | **Pass** — teacher account exists |
| `npm run verify:workflow` | **Pass** — auth, CRUD, edit, save, memory merge |
| `npm run verify:debug` | **Pass** — session + DB read OK |
| `npm run build` | **Pass** |
| Unauth middleware (GET `/` → `/login`, APIs → 401) | **Pass** |
| RLS cross-user isolation (read/update/delete) | **Pass** (verified via post-operation reads) |
| Auth sign-out clears DB access | **Pass** |
| UI generate produces 12-page stories | **Pass** (confirmed in DB: `kindness`, `friendship` stories) |
| Dev server browser activity | **Pass** (login, home, story pages served 200) |

**Not automated (requires facilitator browser pass):** logout button UX, regenerate confirm flow, page-edit blur UX, second-story continuity wording, session after full browser restart.

---

## When to stop

If any **blocker** fails, stop and document root cause before teacher testing:

- Cannot sign in with provisioned teacher account
- Generate fails or returns fewer than 12 pages
- Save fails or story missing from home after save
- Reopen loses edited page text
- RLS leak (user sees another user's story)
- Unauthenticated access to stories or APIs

Non-blockers (do not stop pilot for these alone):

- Mock/template story wording
- Audit/test stories in home list from dev scripts
- No public sign-up (invite-only by design)
