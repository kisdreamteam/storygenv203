# Drift Log

Version: 1.0

Purpose:

This document exists to prevent accidental product drift.

Unresolved decisions belong here.

Implementation should NOT silently change product direction.

---

# 1. What Counts As Drift?

The following are considered product drift:

## Workflow Changes

Examples:

* Changing teacher flow
* Adding new required steps
* Increasing setup complexity
* Changing generation flow

## Input Changes

Examples:

* Adding new required fields
* Changing minimum required inputs
* Increasing configuration requirements

## Output Changes

Examples:

* Adding major new outputs
* Changing story structure
* Changing story expectations

## Product Direction Changes

Examples:

* Adding new user types
* Changing target audience
* Adding major new systems
* Expanding product scope

## Success Metric Changes

Examples:

* Changing speed goals
* Changing completion criteria
* Changing usability expectations

---

# 2. When Specs Must Update First

STOP implementation and update documentation first if changes affect:

* User workflow
* Required inputs
* Outputs
* Product philosophy
* Product goals
* Scope boundaries
* Success metrics
* Product assumptions
* Domain ownership

Rule:

**Documentation changes first**

**Implementation changes second**

---

# 3. When Specs MAY Change

Specifications may change when:

* Validation proves assumptions wrong
* User testing reveals friction
* Simpler solutions are discovered
* Product goals remain aligned
* Changes improve core workflow

Specifications should NOT change because:

* A feature sounds interesting
* Future scaling might require it
* Better technology exists
* Infrastructure allows it

---

# 4. Conflict Rules

When conflicts occur:

1. Higher authority wins
2. Lower authority documents update
3. Implementation does NOT resolve conflicts
4. Unresolved conflicts belong here

---

# 5. Rules For Cursor / LLMs

If Cursor discovers:

* Better architecture
* Better UX
* Better workflow
* Better implementation

Then:

1. Document the change
2. Explain why
3. Decide whether to update specs
4. Implement afterward

Never:

* Silently change product direction
* Silently add scope
* Silently redesign workflows

---

# 6. Feature Challenge Rule

Before implementing features ask:

> Does this improve faster story creation?

If NO:

> Question implementation

If MAYBE:

> Add entry here first

If YES:

> Continue

---

# 7. Drift Log Entry Template

Use this format:

---

Date:

Domain:

Problem:

What changed:

Why change is needed:

Documents affected:

Decision:

Status:

---

Status options:

* Proposed
* Accepted
* Rejected
* Implemented

---

# 8. Resolved Decisions

---

Date: 2026-06-07

Domain: V1 scope and product alignment

Problem: Initial spec documents contained ambiguities — audience conflict, undefined story structure, unclear image workflow, unspecified persistence, hard 2-minute SLA, and missing domain documents.

What changed:

* V1 audience locked to teachers only (parents out of scope)
* V1 deployment locked to private hosted URL (not public launch)
* V1 illustrations locked to prompts only (no in-app image generation)
* Series Memory and story persistence locked to Supabase
* Story structure locked to 12 pages, ~30–40 words per page
* Edit scope locked to text per page + regenerate from edited inputs
* Success metric reframed as soft target (minimal interaction; generation should feel fast)
* Created character-bible.md and illustration-guide.md
* Renamed anti-drift.md to drift-log.md

Why change is needed: Resolve documentation ambiguities before implementation to reduce product drift.

Documents affected: product-spec.md, source-of-truth.md, v1-scope.md, drift-log.md, character-bible.md, illustration-guide.md

Decision: All changes above accepted as V1 baseline.

Status: Accepted

---

Date: 2026-06-07

Domain: Phase C validation — implementation defaults

Problem: Phase C validation identified undocumented defaults for auth, drafts, story list, error behavior, and edit scope boundaries.

What changed:

* Auth: Supabase email + password; invite-only (admin provisions accounts; public sign-up disabled)
* Story list: shows `saved` stories only; drafts not listed on `/`
* Draft persistence: persist `draft` to Supabase on successful generate; survives refresh
* Series Memory: still updates on save only — not on draft or generate
* Story deletion: excluded from V1 — no delete UI
* Illustration prompts: read-only + copy; regenerate for changes
* Vocabulary items: read-only in V1; regenerate for changes
* Story title: auto-generated from theme (truncated short label)
* Generation failure: show error + retry; no memory update; no partial story saved
* Memory load failure: proceed with empty memory + static character bible; non-blocking warning
* Save failure: show error; remain on editor; draft preserved; memory not updated

Why change is needed: Lock simple defaults before implementation so coding proceeds without ambiguity.

Documents affected: drift-log.md, docs/phase-b-architecture-map.md, product-spec.md, v1-scope.md

Decision: All Phase C recommended defaults accepted as V1 baseline.

Status: Accepted

---

Date: 2026-06-08

Domain: Story list / workflow

Problem: Teachers need to remove clutter from the home story list (test stories, unwanted saves). Story deletion was previously excluded from V1.

What changed:

* Story archive (soft delete) added to V1: `is_archived` column on `stories`
* Home list shows `saved` stories where `is_archived = false` only
* Archive UI: X button on home story card; confirm dialog; `POST /api/stories/[id]/archive`
* Series Memory does not update on archive (per source-of-truth)
* No unarchive UI, no hard-delete UI, no archive from story editor

Why change is needed: Reduces home-list clutter without expanding scope to trash/restore flows; supports teacher pilot validation.

Documents affected: drift-log.md, v1-scope.md, docs/phase-b-architecture-map.md, docs/archive/teacher-pilot-test-plan.md

Decision: Soft delete via `is_archived` accepted for V1.

Status: Accepted

---

Date: 2026-06-08

Domain: Save workflow

Problem: Requiring teachers to click Save story after first generation added an unnecessary step. Draft-vs-saved confusion on the home list. Regenerate demoted saved stories back to draft.

What changed:

* Generate auto-saves: creates story, pages, vocabulary, illustration prompts; sets `status = saved`; updates Series Memory
* Regenerate auto-saves: replaces pages, prompts, vocabulary from stored setup inputs; no draft demotion
* Save story is an edit-commit action only — enabled after teacher changes page text, illustration prompts, or story setup inputs
* Edit Story Setup updates stored inputs only; pages unchanged until teacher clicks Regenerate
* Draft status applies only before first successful generation (schema may retain `draft`; generate/regenerate write `saved`)
* Home list shows auto-saved generated stories immediately

Why change is needed: Simplifies first-generation workflow; aligns Series Memory with successful generation; keeps Save for meaningful teacher edits.

Documents affected: product-spec.md, source-of-truth.md, v1-scope.md, drift-log.md, docs/phase-b-architecture-map.md, docs/archive/teacher-pilot-test-plan.md

Decision: Save workflow simplification accepted for V1.

Status: Accepted

---

Date: 2026-06-08

Domain: Character Continuity / Illustrations

Problem: Character appearances and illustration framing were documented with inconsistent clothing descriptors and no standardized prompt suffix. Earlier stories used a distinct Nina & Nino visual identity that needed to be preserved and locked for V1.

What changed:

* V1 locks official character appearances: Nina, Nino, Mom, Dad, Grandpa, Ms. Lee
* Teachers cannot edit character profiles in V1
* Mom always wears yellow áo dài
* Teacher-introduced characters may appear in stories but are not persisted as character profiles
* Official V1 illustration continuity suffix: 16:9 landscape, zoomed-out view, full-body characters, reserved space for educational text overlays, no text/bubbles/labels/watermarks, consistent character appearance
* Future character editing UI explicitly deferred (Edit Characters button, character modal, profile persistence)

Why change is needed: Production-quality character continuity across stories and illustration prompts; keeps core characters visually identical; improves prompt consistency; preserves original Nina & Nino appearance from earlier stories; supports future customization without implementing it now.

Documents affected: character-bible.md, illustration-guide.md, source-of-truth.md, drift-log.md

Decision: V1 locks official Nina & Nino character appearances and introduces a standardized illustration continuity system including 16:9 framing, zoomed-out compositions, full-body visibility, and reserved space for educational text overlays.

Status: Accepted

---

Date: 2026-06-08

Domain: Routing / Auth

Problem: No landing page; story list occupied `/`; logged-in teachers had no dedicated stories home URL.

What changed:

* `/` = public landing page with existing teacher sign-in (invite-only; no new sign-up UI)
* `/stories` = authenticated story list (default home after login)
* `/login` removed; unauthenticated users redirect to `/`
* Post-login and post-save redirects target `/stories`

Why change is needed: Improves teacher speed — logged-in teachers land directly on story management; aligns with V1 workflow (open app → create/reopen stories quickly).

Documents affected: drift-log.md, docs/phase-b-architecture-map.md, .cursor/rules/architecture-freeze.mdc, docs/archive/workflow-validation-checklist.md

Decision: Landing-at-root + `/stories` as authenticated home accepted for V1.

Status: Accepted

---

Date: 2026-06-09

Domain: Characters / Post-V1 Evolution

Problem: Character definitions are currently hardcoded in code and static documentation. Any appearance or personality change requires code or Cursor edits.

What changed:

* Editable Characters **Phase 1** approved for **post-V1 future implementation** (not yet built)
* Scope: editable **global default profiles** for official characters only — Nina, Nino, Mom, Dad, Grandpa, Ms. Lee
* Reset-to-default required (one character, all characters, factory defaults from Character Bible)
* Saved profiles will be used in future story generation and illustration prompts
* **Deferred:** series-scoped profiles, story-specific overrides, teacher-created / story-introduced character persistence (Phases 2–3 per [docs/character-editing-decision-record.md](../character-editing-decision-record.md))

Why change is needed: Teachers need a simple in-app path to adjust official character setup without code changes, while preserving the V1 baseline and avoiding scope creep.

Documents affected: drift-log.md, source-of-truth.md, character-bible.md, illustration-guide.md, docs/phase-b-architecture-map.md, .cursor/rules/architecture-freeze.mdc, docs/roadmap-todo.md, docs/project-changelog.md

Decision: Editable Characters Phase 1 approved for post-V1 implementation planning. Code, schema, and UI not started.

Status: Accepted

---

Date: 2026-06-10

Domain: AI Generation / Illustration Prompts / Character Continuity

Problem: Full illustration prompts became too long for the UI and too expensive/slow for AI generation. OpenAI was being asked to generate locked character continuity blocks and style suffixes that the system already owns and can assemble from saved character profiles.

What changed:

* OpenAI now returns a short per-page `illustration_scene` instead of a full production illustration prompt
* Stored `story_pages.illustration_prompt` now represents the editable short scene, not the full copy-ready prompt
* Story page UI shows/hides the short illustration scene only
* Copy prompt / Copy Illustrations assembles the full production prompt at copy time
* Full production prompt is built from:
  * Supabase character profiles
  * Short AI scene
  * story setting / mood context
  * locked V1 illustration style suffix
* Character detection for prompt assembly uses both page text and short scene
* Legacy full prompts are normalized/extracted into short scene form when edited, saved, or regenerated
* Illustration scene validation was loosened to 10–50 words
* Vocabulary validation was loosened to 1–40 items to avoid false fallback when teachers provide longer vocabulary focus lists

Why change is needed: This keeps the teacher UI readable, reduces OpenAI input/output size, lowers timeout risk, and preserves full copy-ready illustration prompts without asking the LLM to recreate static continuity rules.

Documents affected: drift-log.md, illustration-guide.md, source-of-truth.md, v1-scope.md, phase-b-architecture-map.md, phase-d-mock-first-coding-plan.md, workflow-validation-checklist.md, teacher-pilot-test-plan.md, character-bible.md, roadmap-todo.md

Decision: Accepted for V1. V1 stores and displays short editable illustration scenes, while full production illustration prompts are assembled only when copied/exported. Character continuity and locked illustration style remain system-owned, not LLM-owned.

Status: Accepted

---

Date: 2026-06-10

Domain: AI Generation / Series Memory

Problem: AI output that failed page-length validation silently fell back to mock/template stories, saved them, and updated Series Memory. Archived stories remained in Series Memory forever and continued to influence generation.

What changed:

* Validation failure is separate from API/key failure — no mock save on validation failure
* One AI repair pass (with retry) for repairable short-page failures; revalidate; return 422 if still invalid
* Invalid or empty AI JSON after a successful API response is treated as validation failure, not mock fallback
* Archive (soft delete) rebuilds Series Memory from all active saved, non-archived stories; save uses the same rebuild
* Hard delete not added; soft delete/archive retained

Why change is needed: Teachers expect AI-generated stories, not silent template substitution. Removed stories should not steer future generation.

Documents affected: drift-log.md, source-of-truth.md, phase-b-architecture-map.md, project-changelog.md

Decision: Accepted.

Status: Accepted

---

Date: 2026-06-10

Domain: AI Generation / Story Structure

Problem: When teachers provide Main Events as Week 1–4 milestones under a monthly Topic, the generator treated weeks as optional guidance. Stories drifted across page blocks, disconnected from the Topic, completed early, and used pages 10–12 for recap instead of Week 4 learning.

What changed:

* **Topic-centered 4-week structure is a hard requirement** when Main Events list Week 1–4
* Topic (Theme field) = master monthly umbrella; weeks = Theme 1–4 inside one continuous story
* Page blocks locked: Week 1 → 1–3, Week 2 → 4–6, Week 3 → 7–9, Week 4 → 10–12
* Prompts require Topic visibility on every page, week milestones mandatory, Week 4 meaningful new content
* Validation: keyword matching per week block + Topic anchor per block + recap-heavy Week 4 detection; one repair pass on drift

Why change is needed: Teachers plan by monthly Topic and weekly themes. Out-of-sequence or Topic-disconnected stories weaken pacing, miss educational opportunities, and reduce trust.

Documents affected: drift-log.md, product-spec.md, source-of-truth.md, phase-b-architecture-map.md, project-changelog.md

Decision: Accepted (extends 2026-06-10 four-week structure entry with Topic-centered rules).

Status: Accepted

---

Date: 2026-06-09

Domain: Product / Data Model / AI Generation

Problem: Teachers naturally plan by monthly Topic and Week 1–4 milestones, but the app collected a single Main Events field. This made planning harder and weakened prompt alignment with classroom reading plans.

What changed:

* Replaced Main Events with structured **Monthly Topic + Week 1–4** inputs in UI and API
* Added `stories.weekly_plan` jsonb column; `main_events` retained as derived sync text for legacy reads and series memory
* Generation prompts use Topic as master theme and weeks as required milestones (pages 1–3 / 4–6 / 7–9 / 10–12)
* Week adherence validation and repair **removed from generation pipeline** — deferred to Phase 2 after real-world testing

Why change is needed: Align product data model and prompts with how teachers plan; enable future week adherence validation on structured data.

Documents affected: drift-log.md, product-spec.md, source-of-truth.md, v1-scope.md, phase-b-architecture-map.md, project-changelog.md

Decision: Accepted (Phase 1 — planning model only).

Status: Accepted

---

Date: 2026-06-09

Domain: AI Generation / Story Structure

Problem: Phase 1 structured weekly planning, but generated stories still drifted across page blocks, merged Week 3/4 content, completed early, and leaked internal week language into child-facing text.

What changed:

* **Week adherence validation (Phase 2)** when a complete weekly plan is present
* Keyword matching per page block against teacher week milestones
* Week-content leakage detection and week-language leak detection (weeks never shown to readers)
* Week 4 meaningful-content and timing checks
* One AI repair pass on week adherence failure
* Prompts strengthened: weeks are internal planning only

Why change is needed: Teachers plan by week; drift and visible week labels reduce trust and classroom usability.

Documents affected: drift-log.md, product-spec.md, source-of-truth.md, phase-b-architecture-map.md, project-changelog.md

Decision: Accepted.

Status: Accepted

---

Date: 2026-06-09

Domain: Product / Data Model / AI Generation

Problem: Week adherence validation was ambiguous because each week had only a single events string and one global vocabulary field. Teachers plan both **what happens** and **what words to teach** per week; the generator could not tell which vocabulary belonged on which pages.

What changed:

* **`weekly_plan` jsonb shape** is now `{ week1–week4: { events, vocabulary } }` per week
* UI: **Week N Main Events** + **Week N Vocabulary** (8 fields); global Vocabulary Focus removed from form
* **Week 1–4 Main Events required**; per-week vocabulary optional (falls back to aggregated legacy `vocabulary_focus` or AI-chosen topic words)
* **`vocabulary_focus` text column retained** as derived aggregate on save for legacy reads and series memory
* Prompts pass structured week blocks (events + vocabulary per page range)
* Week adherence validation checks **events and vocabulary** placement per page block
* Legacy flat `{ week1: "string" }` plans normalized at read time; old global vocabulary mapped to Week 1 when per-week vocab empty

Why change is needed: Self-contained weekly inputs reduce drift and match teacher classroom planning.

Documents affected: drift-log.md, product-spec.md, source-of-truth.md, v1-scope.md, phase-b-architecture-map.md, project-changelog.md, roadmap-todo.md

Decision: Accepted.

Status: Accepted

---

Date: 2026-06-09

Domain: Product / AI Generation / Validation

Problem: Requiring Week 1–4 Main Events and enforcing strict keyword/vocabulary placement caused high validation failure rates and contradicted the product goal of minimal teacher setup. Teachers should be able to generate from Topic + Learning Goal alone; weekly fields should lightly guide the story, not act as scripts the AI must keyword-match.

What changed:

* **Required inputs reduced to Monthly Topic + Learning Goal only**
* Week 1–4 Main Events and Vocabulary are **optional guidance hints** — brief direction, not full story scripts
* AI **always** plans four connected weekly beats (pages 1–3 / 4–6 / 7–9 / 10–12) from the Topic when teacher leaves weeks blank
* Generation JSON includes **`inferred_weekly_plan`**; after success, empty teacher weeks are filled from AI inference (teacher-filled weeks are never overwritten)
* **Validation relaxed:** hard fail on structure (12 pages, word counts) and week-language leak in story text only; keyword/vocab placement ratios and Topic-on-10/12 checks removed as hard gates
* Prompts use a single topic-first guidance block for all generations

Why change is needed: Topic-first generation with optional weekly hints matches teacher workflow, reduces friction, and fixes opaque validation failures on real AI output.

Documents affected: drift-log.md, product-spec.md, source-of-truth.md, v1-scope.md, phase-b-architecture-map.md, project-changelog.md

Decision: Accepted (supersedes strict required-week and keyword-validation requirements from 2026-06-09 and 2026-06-10 entries for new behavior).

Status: Accepted

---

Date: 2026-06-09

Domain: Product / Workflow / AI Generation

Problem: Partial weekly guidance (e.g. Week 1 only) still jumped straight to story generation. The model invented weeks 2–4 during the story write with no teacher review, so page blocks did not reliably align to the teacher's Week 1 intent.

What changed:

* **Two-step create workflow on `/stories/new`:** (1) Suggest weekly plan → (2) teacher reviews/edits → (3) Generate story
* New API **`POST /api/stories/suggest-weekly-plan`** — lightweight AI call proposes main-idea beats for empty weeks only; teacher-filled weeks are never overwritten
* **Story generation requires a complete four-week plan** (`isCompleteWeeklyPlan`) — Generate blocked until all four weekly guidance fields have events (manual or after suggest)
* Topic-only create: suggest all four weeks first, then review, then generate
* No new page routes; suggest + review stay on the existing create form

Why change is needed: Teachers need to approve the monthly arc before the 12-page story is written, especially when they only specify early-week direction.

Documents affected: drift-log.md, product-spec.md, source-of-truth.md, v1-scope.md, phase-b-architecture-map.md, project-changelog.md

Decision: Accepted (extends topic-first weekly planning with explicit pre-generation plan assist).

Status: Accepted

---

Date: 2026-06-09

Domain: Product / Characters / Required Inputs

Problem: Learning Goal as a required field adds friction for teachers who only have a monthly Topic. There is no way to hint which official characters (or other names) should appear in a story before generation.

What changed:

* **Required input reduced to Monthly Topic only** — Learning Goal is optional; empty goal stored as `""`; prompts infer educational focus from Topic and weekly plan when omitted
* **Optional character hint toggles** on create/edit setup: Nina + Nino default ON; Mom, Dad, Ms. Lee, Grandpa, Grandma OFF by default; free-text **Other characters** for Tier 2/3 names
* At least one of Nina or Nino must remain selected; if only one protagonist is selected, UI warns and requires confirm before Generate
* Selected characters guide generation at **medium strength** — feature meaningfully across the story, not on every page
* **Grandma added as 7th official Tier 1 character** with locked factory appearance (soft lavender áo dài)
* New `stories.character_hints` jsonb column: `{ "official": ["nina", "nino"], "other": "Sam" }`

Why change is needed: Faster minimal setup and better story direction when teachers know who should appear, without requiring full scripts or learning goals.

Documents affected: drift-log.md, v1-scope.md, source-of-truth.md, phase-b-architecture-map.md, character-bible.md, project-changelog.md

Decision: Accepted.

Status: Accepted

---

Date: 2026-06-09

Domain: Documentation / Product alignment

Problem: Authority docs, changelog, and architecture map lagged behind shipped behavior (optional Learning Goal, complete-plan gate, character hints, suggest/re-suggest UX, relaxed validation, Phase 1 characters). Older drift-log and changelog entries still implied Topic + Learning Goal only, strict week keyword validation, or six official characters without Grandma.

What changed:

* **Current required gate for Generate:** Monthly Topic + complete four-week **events** plan (all four week event fields filled)
* **Learning Goal:** optional — empty string allowed; AI infers focus when omitted
* **Validation (runtime):** structural checks (12 pages, word bounds, scenes, vocabulary JSON) + week-**language** leak detection only; keyword/week vocabulary **placement** matching is **not** enforced (helpers remain in code for reference/tests only)
* Supersedes conflicting wording in earlier topic-first drift entry (2026-06-09) where Generate could proceed with incomplete weekly guidance

Why change is needed: Documentation audit after manual flow changes; align readers with implemented app without changing product scope.

Documents affected: drift-log.md, source-of-truth.md, product-spec.md, phase-b-architecture-map.md, project-changelog.md, story-generation-flow.md (new)

Decision: Accepted (documentation sync only)

Status: Accepted

---

# 9. Current Open Decisions

Use this section for unresolved items.

| Item | Status |
|------|--------|
| Store per-story cast lists in Series Memory `recent_stories` (e.g. `characters_used` from `character_hints`) | **Deferred** — not implemented; plot avoidance uses `key_events` and prompt guidance only |
