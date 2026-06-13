# Story Generation Flow

Version: 1.0

Purpose:

Short, practical reference for the **current** teacher-facing flow and generation behavior. Authority: [source-of-truth.md](before-coding/source-of-truth.md) wins on conflict.

---

## End-to-end user flow

1. **Landing / login** — `/` (public); authenticated teachers go to `/stories`
2. **Stories list** — `/stories`; New Story; Edit Characters (modal); archive from card
3. **Create** — `/stories/new`
4. **Suggest weekly plan** — on create and in Edit Story Setup (when Topic is valid)
5. **Review** — teacher edits four weekly fields (events + vocabulary each)
6. **Generate** — when all four week **events** are filled
7. **Story workspace** — `/stories/[id]`; auto-saved after Generate
8. **Save** — commit page/scene edits only (dirty state)
9. **Edit Story Setup** — modal; suggest + save; then **Regenerate** to apply to pages
10. **Regenerate** — new story from stored setup; auto-saves

---

## Create story flow

| Step | Rule |
|------|------|
| Required | **Monthly Topic** (theme) |
| Optional | Learning Goal, character hints, weekly guidance, setting, tone, words to avoid, notes |
| Suggest | Button visible whenever Topic is valid (including when all four weeks are already filled) |
| Generate gate | All four week **events** fields must be non-empty |
| After Generate | Redirect to `/stories/[id]`; status `saved`; Series Memory rebuilt |

Character hints: Nina + Nino default ON; Mom, Dad, Grandpa, Grandma, Ms. Lee optional toggles; free-text Other; at least one of Nina/Nino required.

---

## Suggest weekly plan

**API:** `POST /api/stories/suggest-weekly-plan`

| Behavior | Detail |
|----------|--------|
| Empty weeks | AI (or mock) proposes beats + vocabulary hints; merged with teacher-filled weeks |
| Teacher-filled weeks | Never overwritten on partial suggest |
| Complete plan + re-suggest | Teacher confirms; `replaceAll: true` replaces all four weeks |
| Character cast | Selected official characters named explicitly in suggest prompts when toggles are set |
| Story shape | Topic hash picks a plot shape (discovery, helper, surprise, etc.) to reduce repetitive beats |

Suggest does **not** write to the database on Edit Story Setup until teacher clicks **Save setup**.

---

## Review before Generate

Teachers must review all four weekly guidance fields before Generate:

* **Events** — main-idea beats for pages 1–3 / 4–6 / 7–9 / 10–12
* **Vocabulary** — per-week word hints (suggested or manual)

Generate stays disabled until every week has **events** filled.

---

## Generate behavior

1. Load Series Memory + character profiles + teacher inputs (including `character_hints`, `weekly_plan`)
2. AI generates 12 pages, vocabulary, short illustration scenes; mock fallback if API unavailable
3. Merge `inferred_weekly_plan` into stored plan when applicable
4. Validate: structure + week-**language** leak (no "week 1" in story text)
5. Auto-save pages, vocabulary, story row; rebuild Series Memory

Prompts include anti-formula / story-variety guidance on first generate and stronger variation on regenerate.

---

## Save behavior

* **Not required** after first Generate or Regenerate (already auto-saved)
* **Save story** on `/stories/[id]` commits page text and illustration scene edits; updates Series Memory
* Edit Story Setup alone does **not** update pages until **Regenerate**

---

## Edit Story Setup

Modal from story workspace. Same fields as create. **Suggest weekly plan** always shown. **Save setup** persists to DB; teacher must **Regenerate** for new page text.

---

## Regenerate behavior

Uses stored setup (including `character_hints`, complete `weekly_plan`). Passes prior page text as anti-repetition context. Replaces all pages and vocabulary; auto-saves; rebuilds Series Memory. UI refreshes page list after success.

---

## Character hints

Stored in `stories.character_hints`. Flow through suggest, generate, and regenerate prompts at medium strength. Do not invent unlisted official characters unless in toggles or Other field.

**Edit Characters** (global profiles) is separate: affects appearance/personality for future generation and copy-assembled illustration prompts.

---

## Series Memory behavior

Updates on successful Generate, Regenerate, Save story, and after archive (rebuild from active saved stories).

Uses compressed `recent_stories` (title, theme, `key_events`, vocab) for plot/theme deduplication in prompts.

**Not stored yet:** per-story cast lists from character hints (`characters_used` in memory — deferred; see drift-log).

---

## Intentionally not enforced (current)

| Area | Status |
|------|--------|
| Strict keyword matching per weekly page block | Not in runtime validation pipeline |
| Strict vocabulary placement per week | Not in runtime validation pipeline |
| Mock/template stories when API unavailable | Generic plot recipe; story-variety prompts do not apply to mock |
| Week labels in story text | **Enforced** — week-language leak fails validation (with repair attempt) |
| Series Memory cast tracking | Deferred |

---

## Smoke test checklist

1. Create with Topic only → Suggest → review weeks → Generate
2. Re-suggest with all weeks filled → confirm → weeks replace
3. Mom + Grandpa toggles → Suggest → week events name characters → Generate → cast in pages
4. Edit Story Setup → Suggest → Save setup → Regenerate → pages update; UI shows new text
5. Edit Characters → save profile → new story Copy prompt uses updated appearance
6. Regenerate 2–3 times → materially different openings/middles; same topic and plan
7. Archive story → confirm it drops from list and memory rebuild warning (if any) is acceptable
