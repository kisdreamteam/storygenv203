# Project Changelog

Version: 1.0

Purpose:

Track meaningful StoryGen project evolution in a human-readable way.

This document summarizes important changes made through Cursor prompts and major project decisions.

It is not a git log or implementation diary.

---

# How To Use This Document

Add a new entry when a Cursor prompt or planning decision changes:

- project direction
- roadmap status
- authority documents
- architecture
- scope
- workflow
- validation status

Do not add entries for tiny code changes.

---

# Entry Template

## YYYY-MM-DD — Short Title

Prompt / Context:

What changed:

Why it changed:

Files affected:

Impact:

Follow-up needed:

---

# Changelog Entries

## 2026-06-09 — AI-Assisted Weekly Plan Step (Pre-Generation)

Prompt / Context:

Partial weekly guidance jumped straight to story generation without teacher review of weeks 2–4.

What changed:

* Two-step create: Suggest weekly plan → review → Generate
* New API `POST /api/stories/suggest-weekly-plan`
* Generate requires complete four-week plan

Why it changed:

Teachers need to approve the monthly arc before the 12-page story is written.

Files affected:

`suggest-weekly-plan` route and lib, `validate-inputs.ts`, `StoryInputForm.tsx`, authority docs

Impact:

Week 1-only input gets AI proposals for weeks 2–4 before story write.

Follow-up needed:

Edit Story Setup suggest button on existing stories (optional).

---

## 2026-06-09 — Topic-First Weekly Planning (Optional Guidance)

Prompt / Context:

Shift from required Week 1–4 Main Events + strict keyword validation to topic-first generation with optional weekly hints.

What changed:

* Required inputs: Monthly Topic + Learning Goal only; weekly fields optional guidance
* Prompts always derive four 3-page weekly beats from Topic; teacher hints steer lightly
* Generation JSON includes `inferred_weekly_plan`; merged into `weekly_plan` after success
* Validation relaxed: structure + week-language leak only; keyword placement hard fails removed

Why it changed:

Minimal setup and real AI output were blocked by mandatory weekly milestones and strict placement checks.

Files affected:

`lib/story/validate-inputs.ts`, `lib/story/weekly-plan.ts`, `lib/generation/prompts.ts`, `lib/generation/validate-output.ts`, `lib/generation/week-structure.ts`, `lib/generation/ai-generation.ts`, generate/regenerate routes, `StorySetupFields.tsx`, authority docs

Impact:

Teachers can generate from Topic alone; inferred weekly plan appears in Edit Setup for review.

Follow-up needed:

Monitor story quality on topic-only generations in teacher pilot.

---

## 2026-06-09 — Week-Specific Events + Vocabulary Planning Model

Prompt / Context:

Replace ambiguous global vocabulary + flat week strings with self-contained weekly planning blocks.

What changed:

* UI: Week 1–4 Main Events + Week 1–4 Vocabulary; global Vocabulary Focus removed from form
* Data: `weekly_plan` jsonb `{ weekN: { events, vocabulary } }`; `vocabulary_focus` derived on save
* Prompts: structured week blocks with events and vocabulary per page range
* Validation: week vocabulary placement checks alongside event adherence
* Legacy: flat week strings and global vocabulary normalized at read time

Why it changed:

Teachers plan both weekly events and weekly vocabulary; a single global vocabulary box caused adherence ambiguity.

Files affected:

`lib/story/weekly-plan.ts`, `lib/story/setup-form-state.ts`, `StorySetupFields.tsx`, `lib/generation/prompts.ts`, `lib/generation/week-structure.ts`, `lib/generation/mock-pipeline.ts`, verification scripts, authority docs, `006_weekly_plan_events_vocabulary_shape.sql`

Impact:

Each 3-page block should primarily cover its week's events and vocabulary when provided.

Follow-up needed:

Monitor shared vocabulary words across weeks (e.g. safety, student) for false positives.

---

## 2026-06-09 — Week Adherence Validation and Repair (Phase 2)

Prompt / Context:

Phase 2 — enforce weekly plan page blocks without exposing week labels to readers.

What changed:

* Week adherence validation: keyword matching per block, leakage detection, week-language leak detection
* Week 4 meaningful-content and timing checks
* One AI repair pass on week adherence failure
* Prompts: weeks are internal teacher planning only — never in story text

Why it changed:

Story audits showed week drift, early Week 4 content, and planning language leaking into child-facing text.

Files affected:

`lib/generation/week-structure.ts`, `lib/generation/validate-output.ts`, `lib/generation/ai-generation.ts`, `lib/generation/prompts.ts`, `lib/story/weekly-plan.ts`, `scripts/verify-week-structure.ts`, authority docs

Impact:

Complete weekly plans now require page-block adherence or validation failure with one repair attempt.

Follow-up needed:

Monitor false positives on keyword matching for multi-word or abstract week milestones.

---

## 2026-06-09 — Topic + Weekly Story Planning (Phase 1)

Prompt / Context:

Replace single Main Events field with Monthly Topic + Week 1–4 structured planning model.

What changed:

* UI: Monthly Topic + Week 1–4 fields; Main Events removed
* Data: `weekly_plan` jsonb column; legacy `main_events` synced for reads and series memory
* Prompts: Topic = master theme; weeks = milestones (pages 1–3 / 4–6 / 7–9 / 10–12)
* Week adherence validation/repair removed from generation pipeline (Phase 2)

Why it changed:

Teachers plan by month and week; structured inputs match classroom planning and enable future validation.

Files affected:

`lib/story/weekly-plan.ts`, story setup UI/components, API routes, `lib/generation/prompts.ts`, migration `005_stories_weekly_plan.sql`, authority docs

Impact:

New stories require Topic + four weekly milestones. Legacy stories load via `resolveWeeklyPlan()`.

Follow-up needed:

Phase 2 — week adherence validation after real-world testing.

---

## 2026-06-10 — Generation Validation + Archive Memory Fixes

Prompt / Context:

Audit of Series Memory lifecycle and generation validation failures.

What changed:

* AI validation failure no longer falls back to mock/template stories or updates Series Memory
* One repair pass (with retry) for short pages below the word minimum; 422 error if repair still fails
* Invalid/empty AI JSON after successful API response treated as validation failure (no mock)
* API/key/timeout failures may still use mock fallback with warning
* Archive and save rebuild Series Memory from active saved, non-archived stories (soft delete retained; no hard delete)

Why it changed:

Teachers should get AI stories or a clear error — not silent template substitution. Archived stories should not influence future generation.

Files affected:

`lib/generation/validate-output.ts`, `lib/generation/ai-generation.ts`, `lib/generation/pipeline.ts`, `lib/series-memory/update.ts`, `app/api/stories/generate/route.ts`, `app/api/stories/[id]/regenerate/route.ts`, `app/api/stories/[id]/archive/route.ts`, `scripts/verify-character-profiles.ts`, authority docs

Impact:

Generation validation and archive behavior now match product intent and architecture map error table.

Follow-up needed:

Monitor repair-pass success rate; tune word minimum only if repair remains insufficient.

---

## 2026-06-10 — Topic-Centered 4-Week Structure Enforcement

Prompt / Context:

Story quality audit — generator treated Week 1–4 as optional; stories drifted from Topic and used Week 4 for recap.

What changed:

* Topic (Theme) = master monthly umbrella; weeks = Theme 1–4 in one continuous story
* Prompts + validation enforce Topic visibility, week page blocks, and meaningful Week 4 content
* Topic-centered 4-week structure documented as hard requirement

Why it changed:

Teachers plan by monthly Topic and weekly themes; disconnected or early-ending stories reduce trust.

Files affected:

`lib/generation/week-structure.ts`, `lib/generation/prompts.ts`, `lib/generation/validate-output.ts`, `lib/generation/ai-generation.ts`, `scripts/verify-week-structure.ts`, authority docs

Impact:

Week 1–4 Main Events now require Topic-centered milestone adherence or validation failure with repair attempt.

Follow-up needed:

Monitor false positives on Topic keyword matching for multi-word themes.

---

## 2026-06-10 — Four-Week Story Structure Enforcement

Prompt / Context:

Story quality audit — generator treated Week 1–4 Main Events as optional guidance.

What changed:

* Week 1–4 page-milestone map enforced in prompts and post-generation validation
* Keyword matching per 3-page block; one repair pass on week drift
* Four-week story structure documented as hard requirement in authority docs

Why it changed:

Teachers plan by week; out-of-sequence stories weaken pacing and trust.

Files affected:

`lib/generation/week-structure.ts`, `lib/generation/prompts.ts`, `lib/generation/validate-output.ts`, `lib/generation/ai-generation.ts`, `scripts/verify-week-structure.ts`, authority docs

Impact:

Stories with Week 1–4 Main Events must align page blocks to weekly milestones or fail validation with repair attempt.

Follow-up needed:

Monitor week-validation false positives on freeform Main Events (validation skipped when Week 1–4 not detected).

---

## 2026-06-09 — Product Roadmap Added

Prompt / Context:

Project moved from strict V1 definition into controlled post-V1 evolution.

What changed:

- Created docs/product-roadmap.md
- Added Post-V1 Evolution section to docs/before-coding/v1-scope.md
- Organized future work into Bucket 1, Bucket 2, and Bucket 3

Why it changed:

The app is now expected to evolve slowly as a personal tool while preserving the original V1 baseline.

Files affected:

- docs/product-roadmap.md
- docs/before-coding/v1-scope.md

Impact:

Future improvements now have a controlled place to live without automatically becoming implementation commitments.

Follow-up needed:

Before Bucket 1 implementation, update drift-log.md, source-of-truth.md, character-bible.md, illustration-guide.md, phase-b-architecture-map.md, and architecture freeze rules.

---

## 2026-06-09 — Editable Characters Promoted To Bucket 1

Prompt / Context:

Character definitions are currently hardcoded and can only be changed through Cursor/code edits.

What changed:

- Added Character System → Phase 1: Editable Characters to Bucket 1 in product-roadmap.md

Why it changed:

Editable character setup improves the existing core workflow by allowing small character adjustments from the app instead of code.

Files affected:

- docs/product-roadmap.md

Impact:

Editable official characters are now a planned post-V1 core product evolution item, but not yet approved for implementation.

Follow-up needed:

Before implementation, update authority docs and architecture freeze, then create a dedicated implementation plan.

---

## 2026-06-09 — Character Editing Direction Recorded

Prompt / Context:

The user clarified how character editing should work after V1.

What changed:

- Added character-editing-decision-record.md
- Clarified global editable defaults
- Deferred series-level profiles
- Documented story-specific overrides as future hidden story-only adjustments
- Documented story-introduced recurring characters as a future continuity direction

Why it changed:

Character definitions are currently hardcoded, which limits app-based editing. The project needs a simple path toward editable character setup without immediately overcomplicating scope.

Files affected:

- docs/character-editing-decision-record.md
- docs/roadmap-todo.md
- docs/product-roadmap.md
- docs/project-changelog.md

Impact:

Editable Characters now has a documented direction. It is still not ready for implementation until authority documents and architecture rules are updated.

Follow-up needed:

Update drift-log.md, source-of-truth.md, character-bible.md, illustration-guide.md, phase-b-architecture-map.md, and architecture-freeze.mdc before code.

---

## 2026-06-09 — Editable Characters Phase 1 Approved For Planning

Prompt / Context:

Character editing direction was recorded; authority documents needed updating before any implementation.

What changed:

- Added accepted drift-log entry for Editable Characters Phase 1
- Updated source-of-truth.md, character-bible.md, illustration-guide.md with post-V1 Phase 1 rules
- Added phase-b-architecture-map.md §11 future architecture note (`character_profiles`, generation flow, Edit Characters UI)
- Added architecture-freeze.mdc approved post-V1 exception
- Marked roadmap-todo documentation prerequisites complete

Why it changed:

Promote Editable Characters from planned direction to approved future implementation candidate while keeping Phase 2 and Phase 3 deferred.

Files affected:

- docs/before-coding/drift-log.md
- docs/before-coding/source-of-truth.md
- docs/before-coding/character-bible.md
- docs/before-coding/illustration-guide.md
- docs/phase-b-architecture-map.md
- .cursor/rules/architecture-freeze.mdc
- docs/roadmap-todo.md
- docs/project-changelog.md

Impact:

Phase 1 (editable global official character profiles with reset-to-default) is approved for implementation planning. No code or schema changes were made. V1 locked character behavior remains in force until Phase 1 ships.

Follow-up needed:

Write implementation plan; then build Phase 1 only (no series scope, story overrides, or teacher-created characters).

---

## 2026-06-09 — Editable Characters Phase 1 — Database Foundation Implemented

Prompt / Context:

Step 1 of Editable Characters Phase 1 — database foundation only.

What changed:

- Added `supabase/migrations/004_character_profiles.sql` — table, RLS, seed for six official characters
- Extended `scripts/verify-supabase.mjs` with character_profiles checks
- Marked roadmap-todo table + seed items complete

Why it changed:

Persist editable global character profiles before UI, API, and generation wiring (Steps 2–8).

Files affected:

- supabase/migrations/004_character_profiles.sql
- scripts/verify-supabase.mjs
- docs/roadmap-todo.md
- docs/project-changelog.md

Impact:

Database foundation ready. Six official characters seeded with factory appearance and personality from Character Bible. No UI, API, generation, or illustration behavior changed.

Follow-up needed:

Step 2 — `lib/character-profiles/` resolver; then API, generation wiring, and Edit Characters modal per implementation plan.

---

## 2026-06-09 — Editable Characters Phase 1 Resolver Layer Added

Prompt / Context:

Step 2 — character profile resolver/helper layer only.

What changed:

- Added `lib/character-profiles/` — types, factory defaults, load, resolve, normalize
- Added `scripts/verify-character-profiles.ts` and `npm run verify:character-profiles`

Why it changed:

Bridge between `character_profiles` table and future generation integration without changing app behavior yet.

Files affected:

- lib/character-profiles/*
- scripts/verify-character-profiles.ts
- package.json
- docs/roadmap-todo.md
- docs/project-changelog.md

Impact:

DB-backed profiles can be loaded and merged with factory fallback. No UI, API, generation, or illustration behavior changed.

Follow-up needed:

Step 3 — API routes; then wire resolver into generation and illustration paths.

---

## 2026-06-09 — Editable Characters Phase 1 Story Generation Integration Added

Prompt / Context:

Step 3 — wire character profile resolver into story generation prompt building only.

What changed:

- Story generation loads resolved character profiles in `lib/generation/pipeline.ts`
- `buildSystemPrompt` accepts resolved profiles and includes dynamic official character appearance/personality context
- Static Character Bible excerpt retained for series tone and structure; `TIER1_CHARACTER_RULES` unchanged (illustration continuity for Step 4)
- Extended `verify:character-profiles` with story prompt formatter checks

Why it changed:

Future story text generation should use saved `character_profiles` values when available, with factory fallback via the existing resolver.

Files affected:

- lib/character-profiles/format-for-story-prompt.ts
- lib/character-profiles/index.ts
- lib/constants/character-bible.ts
- lib/generation/prompts.ts
- lib/generation/pipeline.ts
- lib/generation/ai-generation.ts
- scripts/verify-character-profiles.ts
- docs/roadmap-todo.md
- docs/project-changelog.md

Impact:

Story generation prompt context now uses resolved character profiles; DB profile values win over factory defaults; factory fallback remains. Illustration prompts, UI, reset behavior, API routes, and schema were not changed.

Follow-up needed:

Step 4 — wire resolved profiles into illustration prompt continuity.

---

## 2026-06-09 — Editable Characters Phase 1 Illustration Prompt Integration Added

Prompt / Context:

Step 4 — wire character profile resolver into illustration prompt continuity only.

What changed:

- Illustration continuity blocks built from resolved `appearanceDescription` via `buildCharacterContinuityMap`
- `injectIllustrationContinuityIntoPages` and `buildIllustrationPrompt` accept profiles from the generation pipeline
- Per-page prompt regeneration loads profiles in lib layer (no API route changes)
- `formatOfficialCharacterRulesForAi(profiles)` uses resolved appearances in story-generation AI rules
- Clipboard copy path unchanged — uses factory continuity when profiles are not passed

Why it changed:

Newly generated or regenerated illustration prompts should reflect saved `character_profiles` appearances with factory fallback.

Files affected:

- lib/character-profiles/format-for-illustration-continuity.ts
- lib/character-profiles/types.ts
- lib/character-profiles/index.ts
- lib/generation/character-continuity.ts
- lib/generation/pipeline.ts
- lib/generation/prompts.ts
- lib/generation/regenerate-page-prompt.ts
- scripts/verify-character-profiles.ts
- docs/roadmap-todo.md
- docs/project-changelog.md

Impact:

Illustration prompt continuity now uses resolved character profile appearances; DB values win over factory defaults; global illustration suffix unchanged. Existing saved stories are not rewritten. UI, API routes, schema, and reset behavior were not changed.

Follow-up needed:

Edit Characters UI, save API, and reset behavior per implementation plan.

---

## 2026-06-10 — Per-Page Illustration Prompt Show/Hide Toggle

Prompt / Context:

Manual UX change on the story detail page — illustration prompts are long for continuity but clutter the page layout.

What changed:

- Per-page **Show Prompt** / **Hide Prompt** toggle next to **Copy prompt** on `/stories/[id]`
- Illustration prompt text hidden by default on each page; toggled individually
- Copy prompt, edit prompt, and regenerate prompt behavior unchanged

Why it changed:

Reduce visual noise on the story editor while keeping full prompts accessible on demand.

Files affected:

- components/story/StoryPageItem.tsx
- components/story/PromptEditor.tsx
- docs/project-changelog.md

Impact:

UI-only; no workflow, data model, or prompt-generation changes.

Follow-up needed:

None. Optional future: global “show all prompts” control (out of scope for now).

---

## 2026-06-10 — AI Illustration Scene Split

Prompt / Context:

Story generation and regeneration were timing out because OpenAI was asked to produce full locked illustration prompts (continuity blocks, style suffix) for all 12 pages in one JSON response — work the server already discarded and rebuilt from character profiles.

What changed:

- OpenAI now returns a short `illustration_scene` (30–50 words) per page instead of a full `illustration_prompt`
- Story-generation system prompt slimmed: removed locked continuity blocks and illustration format rules from the LLM context
- Server assembles final copy-ready prompts from resolved `character_profiles` + AI scene + setting + mood + locked style suffix
- Character detection for continuity uses page text and AI scene together

Why it changed:

Reduce OpenAI input/output size and generation latency while keeping teacher-facing illustration prompts unchanged.

Files affected:

- lib/generation/prompts.ts
- lib/generation/validate-output.ts
- lib/generation/character-continuity.ts
- scripts/verify-character-profiles.ts
- docs/before-coding/illustration-guide.md
- docs/project-changelog.md

Impact:

Generate and Regenerate should be less prone to timeout fallback. Saved `illustration_prompt` format in the UI is unchanged. Mock fallback and per-page Regenerate prompt behavior unchanged.

Follow-up needed:

Monitor Generate/Regenerate in production; adjust scene word-count bounds if validation rejects valid model output too often.

---

## 2026-06-10 — Scene-Only Illustration UI

Prompt / Context:

After the AI Illustration Scene Split, full continuity blocks were still saved to the database and shown in the UI even though teachers only need the short visual scene for review and editing.

What changed:

- **Stored:** `illustration_prompt` holds short scene (30–50 words), not full continuity blocks
- **UI:** Teachers see/edit scene only; Show/Hide toggle unchanged; label reads "Illustration scene"
- **Copy:** Full production prompt assembled from Supabase character profiles + scene + locked style (Copy prompt and Copy Illustrations)
- **Legacy:** Existing full prompts display extracted scene; DB normalized on edit/save/regenerate

Why it changed:

Keep the story editor focused on the editable visual moment while continuity and style stay assembled only when copying for external image generation.

Files affected:

- lib/generation/pipeline.ts
- lib/generation/mock-pipeline.ts
- lib/generation/regenerate-page-prompt.ts
- lib/story/resolve-production-prompt.ts
- lib/story/format-export.ts
- components/story/StoryPageItem.tsx
- components/story/StoryPagesSection.tsx
- app/stories/[id]/page.tsx
- docs/before-coding/illustration-guide.md
- docs/project-changelog.md

Impact:

Story page UI is less cluttered. Copy output remains full production prompts with current character profiles from Supabase.

Follow-up needed:

None.

---

## 2026-06-10 — Illustration Scene Word Bounds Loosened

Prompt / Context:

Generate was falling back to the template story when the AI returned slightly short but usable illustration scenes (e.g. 27 words on one page).

What changed:

- `illustration_scene` validation: 30–50 → 20–50 words
- AI system prompt and JSON schema updated to match

Why it changed:

Reduce false fallback when the model produces valid scenes that fall a few words below the previous minimum.

Files affected:

- lib/generation/validate-output.ts
- lib/generation/prompts.ts
- docs/before-coding/illustration-guide.md
- docs/project-changelog.md

Impact:

Stories with scenes between 20–29 words now pass validation instead of triggering mock fallback.

Follow-up needed:

None.

---

## 2026-06-10 — Vocabulary Count Bounds Loosened

Prompt / Context:

Generate and Regenerate were falling back to the template story when the AI returned more than 7 vocabulary items (e.g. 8 items from a long vocabulary focus).

What changed:

- vocabulary validation: 5–7 → 1–40 items
- AI system prompt and character-bible updated to match

Why it changed:

Reduce false fallback when the model includes all words from the teacher's vocabulary focus.

Files affected:

- lib/generation/validate-output.ts
- lib/generation/prompts.ts
- docs/before-coding/character-bible.md
- docs/project-changelog.md

Impact:

Stories with 8+ vocabulary items (up to 40) now pass validation instead of triggering mock fallback.

Follow-up needed:

None.

---

## 2026-06-10 — Illustration Scene Minimum Lowered

Prompt / Context:

Regenerate was falling back to the template story when the AI returned slightly short illustration scenes (e.g. 19 words on page 10).

What changed:

- `illustration_scene` validation: 20–50 → 10–50 words
- AI system prompt and illustration-guide updated to match

Why it changed:

Reduce false fallback when the model produces valid scenes that fall below the previous 20-word minimum.

Files affected:

- lib/generation/validate-output.ts
- lib/generation/prompts.ts
- docs/before-coding/illustration-guide.md
- docs/project-changelog.md

Impact:

Scenes between 10–19 words now pass validation instead of triggering mock fallback.

Follow-up needed:

None. Accepted decision recorded in [drift-log.md](before-coding/drift-log.md) (2026-06-10 — AI Generation / Illustration Prompts / Character Continuity).

---

## 2026-06-10 — Edit Characters Phase 1 UI

Prompt / Context:

Character profile foundation (table, seed, resolver, generation, copy-time assembly) was complete; teachers had no in-app way to edit official character appearance and personality.

What changed:

- **Edit Characters** button on `/stories` header (modal only; no new route)
- Modal for six official characters with appearance and personality textareas
- Save updates global `character_profiles` rows; reset one or reset all restores factory defaults from seeded `factory_*` columns
- Unsaved-changes guard when switching characters or closing modal (Save / Discard / Cancel)
- API: `GET /api/character-profiles`, `PATCH /api/character-profiles/[character_key]`, `POST /api/character-profiles/reset`
- UI note: changes affect future stories only; existing saved stories are not rewritten

Why it changed:

Complete Editable Characters Phase 1 teacher workflow without rebuilding foundation or expanding into story overrides, presets, or per-teacher profiles.

Files affected:

- app/api/character-profiles/*
- components/characters/EditCharactersButton.tsx
- components/characters/EditCharactersModal.tsx
- lib/character-profiles/validate-editable-fields.ts
- lib/character-profiles/api-types.ts
- app/stories/page.tsx
- docs/roadmap-todo.md
- docs/project-changelog.md

Impact:

Teachers can edit global Nina & Nino family profiles in-app; next Generate, Regenerate, and Copy illustration prompt use saved values. Phase 2/3 (story overrides, teacher-created characters) remain out of scope.

Follow-up needed:

None.

---

## 2026-06-10 — Documentation Sync After Edit Characters Phase 1

Prompt / Context:

Authority and planning docs still described Editable Characters Phase 1 as future-only or not implemented after the UI shipped.

What changed:

- **source-of-truth.md** — V1 character rules labeled historical baseline; Post-V1 Phase 1 section updated to shipped behavior
- **character-bible.md** — sections 1, 15, 16 aligned: frozen V1 exclusions preserved; Phase 1 marked implemented
- **illustration-guide.md** — frozen V1 exclusions preserved; section 14 updated to shipped copy-time profile behavior
- **character-editing-decision-record.md** — Phase 1 checklist complete; Phase 2/3 remain documented only
- **editable-characters-implementation-plan.md** — status and appendix updated to shipped
- **roadmap-todo.md** — implementation-complete note; unsaved-changes guard checked

Why it changed:

Keep documentation accurate after Phase 1 ship without approving Phase 2/3 or expanding scope.

Files affected:

- docs/before-coding/source-of-truth.md
- docs/before-coding/character-bible.md
- docs/before-coding/illustration-guide.md
- docs/character-editing-decision-record.md
- docs/editable-characters-implementation-plan.md
- docs/roadmap-todo.md
- docs/project-changelog.md

Impact:

Readers can distinguish frozen historical V1 baseline from current post-V1 Phase 1 behavior. Phase 2/3 explicitly remain not approved.

Follow-up needed:

Optional: sync `docs/phase-b-architecture-map.md` §11 and drift-log Phase 1 status line if those files are reviewed next.

---

## 2026-06-10 — Story Quality Sprint 1 — Prompt Refinement

Prompt / Context:

Manual audit of six generated themes (Art Class, Toy Store, Aquarium, Bakery, Birthday Party, Dentist) found strong workflow and page flow, but recurring weaknesses: generic endings, repetitive emotional language, and vocabulary introduced without enough mid- and late-story reinforcement.

What changed:

- Added **Story quality (strict)** block to AI system prompt in `lib/generation/prompts.ts`
- Instructions cover page rhythm (pages 1–12), ending requirements (callback, reflection, warm close), vocabulary cadence (pages 2–4 / 5–8 / 10–11), word variety for common emotional terms, and limiting unnecessary adult cameos

Why it changed:

Improve first-draft story quality via prompt-only refinement without changing workflow, routes, schema, validation bounds, UI, character profiles, or illustration scene architecture.

Files affected:

- lib/generation/prompts.ts
- docs/roadmap-todo.md
- docs/project-changelog.md

Impact:

Future **Generate** and **Regenerate** calls use the refined instructions. Existing saved stories are unchanged. No drift-log entry — prompt tuning within the existing Story Quality backlog.

Follow-up needed:

Manual validation on Birthday party, Dentist visit, and Aquarium or bakery themes; additional Story Quality sprints if audits still show gaps in educational usefulness or page-to-page continuity.

---

## 2026-06-10 — Story Quality Sprint 2 — Prompt Refinement

Prompt / Context:

Round 2 manual audits after Sprint 1 still showed repetitive wording, unnecessary adult cameos, weak story engines (no clear goal or question), generic final-page summaries, and vocabulary not always reinforced naturally.

What changed:

- Expanded **Story quality (strict)** block in `lib/generation/prompts.ts` (Sprint 2 supersedes Sprint 1 prompt text in the same constant)
- Added required story engine (goal, question, challenge, discovery) established by page 3
- Strengthened adult cameo rules; community workers when relevant; no one-line cameos
- Stricter word-variety ban list and suggested simple alternatives
- Stronger ending rules: specific object/action callbacks, anti-summary pages 10–12, expanded banned generic closings
- Stronger vocabulary cadence including page 12 story-feeling close

Why it changed:

Further improve first-draft quality through prompt-only refinement without changing workflow, routes, schema, validation, UI, or illustration architecture.

Files affected:

- lib/generation/prompts.ts
- docs/roadmap-todo.md
- docs/project-changelog.md

Impact:

Future **Generate** and **Regenerate** use Sprint 2 instructions. Existing saved stories unchanged. No drift-log entry.

Follow-up needed:

Manual validation on Post Office, Space Adventure, Fire Station, Rainy Day House Party, and Library themes.

---

## 2026-06-10 — Standalone Story Generation Rule

Prompt / Context:

Generated stories often opened with references to previous adventures ("They remember visiting the zoo," "last time," etc.). Classroom stories are not always taught in sequence; each story should work on its own.

What changed:

- **Standalone story (strict)** rules in `lib/generation/prompts.ts` — self-contained stories; no prior-story references unless teacher asks for sequel/continuation in inputs
- Removed system prompt line encouraging optional page-1 Series Memory callbacks
- User prompt clarifies Series Memory is for deduplicating plots/themes/vocabulary only — not for story-text callbacks
- **Mock fallback** in `lib/generation/mock-pipeline.ts` — always standalone page 1 (removed "Nina and Nino remember…")
- `scripts/verify-workflow.mjs` — memory check updated to expect stored theme for dedup, not callback text

Why it changed:

Teachers may use stories in any order; automatic previous-story callbacks confuse standalone classroom use while Series Memory still avoids repetition internally.

Files affected:

- lib/generation/prompts.ts
- lib/generation/mock-pipeline.ts
- scripts/verify-workflow.mjs
- docs/roadmap-todo.md
- docs/project-changelog.md

Impact:

Future **Generate** and **Regenerate** produce standalone stories by default. Series Memory, character profiles, and save/regenerate workflow unchanged. No drift-log entry.

Follow-up needed:

None.

---

## 2026-06-10 — Regenerate Variation — Prompt Refinement

Prompt / Context:

Regenerate used the same generation path as initial Generate with identical prompts, so teachers often received nearly the same story when inputs were unchanged.

What changed:

- Internal `GenerationMode` (`generate` | `regenerate`) threaded through `lib/generation/pipeline.ts`, `lib/generation/ai-generation.ts`, and `lib/generation/prompts.ts`
- Regenerate route loads existing `story_pages` text before replace and passes compact anti-repetition context to the user prompt
- Regeneration instructions require substantially different plot structure, opening, middle activity, dialogue, and ending while keeping same theme, learning goal, vocabulary, and teacher constraints
- Mock fallback varies page templates on regenerate via variant index

Why it changed:

Make Regenerate feel useful — same educational inputs, meaningfully different story version — without UI, schema, or workflow changes.

Files affected:

- lib/generation/types.ts
- lib/generation/prompts.ts
- lib/generation/pipeline.ts
- lib/generation/ai-generation.ts
- lib/generation/mock-pipeline.ts
- app/api/stories/[id]/regenerate/route.ts
- scripts/verify-character-profiles.ts
- docs/roadmap-todo.md
- docs/project-changelog.md

Impact:

**Regenerate** produces variation-aware prompts; **Generate** unchanged. Existing saved stories only change through normal regenerate. No drift-log entry.

Follow-up needed:

Manual validation: generate Art Class, regenerate 3+ times, confirm pages 1/6/12 differ while theme and vocabulary stay aligned.

---

## 2026-06-10 — Story Quality Validation Tolerance

Prompt / Context:

Regenerate variation sometimes failed validation when one page was slightly short (e.g. 17–24 words). Strict prompt wording also discouraged natural positive emotional repetition for ages 4–6.

What changed:

- Page word minimum: 20 → **25** words in `lib/generation/validate-output.ts` (max 55 unchanged)
- System prompt: aim for 30–40 words; ~25 acceptable if meaning is complete; no filler padding
- Word variety guidance relaxed: allow natural repetition of happy, excited, smile, laugh, cheer, proud; still vary sentence structures
- `scripts/verify-character-profiles.ts`: word-count boundary and prompt guidance checks

Why it changed:

Reduce false AI fallback on regenerate while keeping structural validation (12 pages, scenes, vocabulary, JSON) intact.

Files affected:

- lib/generation/validate-output.ts
- lib/generation/prompts.ts
- scripts/verify-character-profiles.ts
- docs/roadmap-todo.md
- docs/project-changelog.md

Impact:

Slightly shorter but complete pages pass validation. Broken structure still fails. No drift-log entry.

Follow-up needed:

None.
