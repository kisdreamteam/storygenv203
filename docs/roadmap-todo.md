# Roadmap TODO

Version: 1.0

Purpose:

Track tactical next steps for roadmap work.

This document turns product-roadmap.md into manageable implementation candidates.

Authority:

This document is below:

1. docs/before-coding/product-spec.md
2. docs/before-coding/source-of-truth.md
3. docs/before-coding/v1-scope.md
4. docs/before-coding/drift-log.md
5. docs/product-roadmap.md

Rules:

- This document does not approve implementation by itself.
- Bucket 1 items still require authority updates before code.
- Bucket 2 items require validation before promotion.
- Bucket 3 items remain parked.
- Do not use this file to bypass documentation-first discipline.

---

# Bucket 1 — Active Candidates

## Character System — Phase 1: Editable Characters

Status: Approved for implementation planning; code not started

**Decision record:** [docs/character-editing-decision-record.md](character-editing-decision-record.md)

### Documentation prerequisites

- [x] Add accepted drift-log entry for Editable Characters
- [x] Update source-of-truth.md to allow post-V1 editable official characters
- [x] Update character-bible.md to distinguish locked V1 characters from editable post-V1 profiles
- [x] Update illustration-guide.md to explain prompts should use saved character profiles when available
- [x] Update phase-b-architecture-map.md with character_profiles table and generation flow change
- [x] Update architecture-freeze.mdc to allow the new table and UI entry point

### Implementation candidates

Documentation prerequisites complete. Do not start code until an implementation plan is written.

- [x] Create character_profiles table
- [x] Seed Nina, Nino, Mom, Dad, Grandpa, and Ms. Lee
- [x] Create character profile resolver/helper layer
- [ ] Load character profiles during generation
- [ ] Add Edit Characters button
- [ ] Add Edit Characters modal
- [ ] Allow editing appearance descriptions
- [ ] Allow editing personality descriptions
- [ ] Save character edits
- [x] Use saved profiles in story generation
- [x] Use saved profiles in illustration prompts

### Open decisions

- [x] **Global default profiles:** Yes — editable global defaults with reset-to-default ([decision record](character-editing-decision-record.md) §1)
- [x] **Series scope:** Not for this version — defer until multiple series exist ([decision record](character-editing-decision-record.md) §2)
- [x] **Story-specific overrides:** Yes eventually — hidden by default, story-only ([decision record](character-editing-decision-record.md) §3)
- [x] **Reset-to-default:** Yes — required (one character, all characters, factory defaults) ([decision record](character-editing-decision-record.md) §1)
- [x] **Teacher-created characters:** Yes eventually — after official editable profiles ([decision record](character-editing-decision-record.md) §4)

---

# Bucket 1 — Future Core Improvements

## Story Quality

Status: Backlog

- [ ] Reduce repetitive wording
- [ ] Improve story endings
- [ ] Improve educational usefulness
- [ ] Improve vocabulary integration
- [ ] Improve continuity between pages

## Illustration Prompt Quality

Status: Backlog

- [ ] Improve prompt consistency
- [ ] Improve scene descriptions
- [ ] Improve visual clarity
- [ ] Improve copy-to-external-tool usefulness

## Teacher Workflow

Status: Backlog

- [ ] Improve setup form clarity
- [ ] Improve save workflow clarity
- [ ] Improve story organization
- [ ] Improve archive workflow

---

# Bucket 2 — Experiments

Status: Not committed

- [ ] Character presets
- [ ] Story quality scoring
- [ ] Story comparison view
- [ ] Story rewrite assistant
- [ ] Vocabulary tracker
- [ ] Reading difficulty indicator
- [ ] Prompt optimizer
- [ ] Continuity inspector

---

# Bucket 3 — Parked Ideas

Status: Do not build yet

- [ ] In-app image generation
- [ ] PDF export
- [ ] Print packs
- [ ] Audio narration
- [ ] Student mode
- [ ] Parent mode
- [ ] Multiple story series
- [ ] Worksheets
- [ ] Activities generation
- [ ] Lesson plans
- [ ] Marketplace
- [ ] Payments
- [ ] Analytics
