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

Optional doc sync: source-of-truth.md and character-bible.md still mention "cannot edit profiles in V1" in some sections.
