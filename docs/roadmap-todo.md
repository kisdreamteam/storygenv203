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

Status: Phase 1 foundation + Edit Characters UI shipped; Phase 2/3 not started

**Decision record:** [docs/character-editing-decision-record.md](character-editing-decision-record.md)

### Documentation prerequisites

- [x] Add accepted drift-log entry for Editable Characters
- [x] Update source-of-truth.md to allow post-V1 editable official characters
- [x] Update character-bible.md to distinguish locked V1 characters from editable post-V1 profiles
- [x] Update illustration-guide.md to explain prompts should use saved character profiles when available
- [x] Update phase-b-architecture-map.md with character_profiles table and generation flow change
- [x] Update architecture-freeze.mdc to allow the new table and UI entry point

### Implementation candidates

Documentation prerequisites complete. Phase 1 implementation shipped 2026-06-10. Phase 2/3 remain documented only — not approved for implementation.

#### Character profile foundation

- [x] Create character_profiles table
- [x] Seed Nina, Nino, Mom, Dad, Grandpa, and Ms. Lee
- [x] Create character profile resolver/helper layer
- [x] Load character profiles during generation
- [x] Use saved profiles in story generation
- [x] Use saved profiles in production illustration prompt assembly

#### Illustration prompt architecture

See drift-log entry (2026-06-10 — AI Generation / Illustration Prompts / Character Continuity).

- [x] Store short illustration scene per page
- [x] Display short illustration scene in the UI
- [x] Hide illustration scene by default
- [x] Add Show/Hide illustration scene toggle
- [x] Assemble full production prompt only on Copy prompt / Copy Illustrations

#### Character editing UI

- [x] Add Edit Characters button
- [x] Add Edit Characters modal
- [x] Allow editing appearance descriptions
- [x] Allow editing personality descriptions
- [x] Save character edits
- [x] Unsaved-changes guard when switching characters or closing modal

### Open decisions

- [x] **Global default profiles:** Yes — editable global defaults with reset-to-default ([decision record](character-editing-decision-record.md) §1)
- [x] **Series scope:** Not for this version — defer until multiple series exist ([decision record](character-editing-decision-record.md) §2)
- [x] **Story-specific overrides:** Yes eventually — hidden by default, story-only ([decision record](character-editing-decision-record.md) §3)
- [x] **Reset-to-default:** Yes — required (one character, all characters, factory defaults) ([decision record](character-editing-decision-record.md) §1)
- [x] **Teacher-created characters:** Yes eventually — after official editable profiles ([decision record](character-editing-decision-record.md) §4)

---

# Bucket 1 — Future Core Improvements

## Story Quality

Status: Backlog — Sprint 1, Sprint 2, and Regenerate Variation shipped; further iterations pending

- [x] Reduce repetitive wording (regenerate anti-copy)
- [x] Improve story endings (regenerate variation rule)
- [ ] Improve educational usefulness
- [ ] Improve vocabulary integration
- [ ] Improve continuity between pages

### Story Quality Sprint 1 (prompt-only)

Status: Implemented 2026-06-10

- [x] Improve story endings (pages 10–12)
- [x] Reduce repetitive emotional wording
- [x] Improve vocabulary reinforcement cadence
- [x] Page rhythm guidance
- [x] Limit unnecessary adult cameos

### Story Quality Sprint 2 (prompt-only)

Status: Implemented 2026-06-10

- [x] Require clear story engine (goal, question, challenge, or discovery)
- [x] Strengthen adult cameo rules and community-worker guidance
- [x] Stricter word-variety limits and age-appropriate alternatives
- [x] Stronger pages 10–12 (anti-summary, specific callbacks)
- [x] Stronger vocabulary reinforcement through page 12

- [x] Prevent unnecessary previous-story callbacks (standalone generation)

### Regenerate Variation (prompt-only)

Status: Implemented 2026-06-10

- [x] Meaningfully different story on Regenerate with same teacher inputs
- [x] Pass prior page text as anti-repetition context
- [x] Internal generate vs regenerate mode in pipeline

### Validation tolerance (prompt + bounds)

Status: Implemented 2026-06-10

- [x] Lower page word bound 20 → 25 words (target remains 30–40)
- [x] Prompt: allow slightly shorter complete pages; no filler padding
- [x] Prompt: allow natural positive emotional repetition for ages 4–6

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
