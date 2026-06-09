# Product Roadmap

Version: 1.0

Purpose:

Track **controlled evolution** after the original V1 definition phase.

This document is **not** a product redesign and **not** a scope expansion. It defines how future improvements are proposed, classified, validated, and optionally implemented.

**Authority context:**

* V1 baseline: [docs/before-coding/v1-scope.md](before-coding/v1-scope.md)
* Locked truths: [docs/before-coding/source-of-truth.md](before-coding/source-of-truth.md)
* Decision log: [docs/before-coding/drift-log.md](before-coding/drift-log.md)

**Rule:** Items in this roadmap are **not committed work** until promoted through the bucket rules below and documented in `drift-log.md` before implementation.

---

# Bucket Framework

| Bucket | Name | Meaning |
|--------|------|---------|
| **Bucket 1** | Core Product Evolution | Actively planned improvements to the existing StoryGen teacher workflow |
| **Bucket 2** | Experiments | Optional trials; must prove value before promotion |
| **Bucket 3** | Future Possibilities | Parked ideas only; no implementation without new justification |

## Promotion rules

| From | To | Requirement |
|------|-----|-------------|
| Bucket 3 | Bucket 2 | Written justification + facilitator or pilot signal |
| Bucket 2 | Bucket 1 | Validation outcome documented; drift-log entry; affected authority docs updated |
| Bucket 1 | Implementation | Architecture / source-of-truth updates as needed; drift-log **Accepted** entry |

Bucket 1 items may be implemented **incrementally**. Each increment must still respect locked V1 behavior until explicitly superseded in documentation.

---

# Bucket 1 — Core Product Evolution

Actively planned improvements that extend the current workflow without replacing it.

## Character System → Phase 1: Editable Characters

**Status:** Planned (post-V1)

**Problem:** Official character definitions (Nina, Nino, Mom, Dad, Grandpa, Ms. Lee) are locked in static documentation and code for V1. Teachers cannot adjust appearance or personality descriptions without code changes.

**Goal:** Allow teachers to view and edit official character profiles while preserving the existing story creation workflow.

**Scope (Phase 1):**

* Move character definitions from code into database
* Create `character_profiles` table
* Seed existing official characters from [character-bible.md](before-coding/character-bible.md)
* Create **Edit Characters** button (authenticated teacher UI entry point)
* Create **Edit Characters** modal
* Allow editing **appearance** descriptions
* Allow editing **personality** descriptions
* Save character edits to database
* Use saved character profiles during generation (replace static bible injection for official characters)

**Out of scope for Phase 1:**

* Tier 2 / teacher-introduced character persistence
* Per-teacher character sets or multiple series
* In-app image generation or reference-image upload
* Changes to required story inputs or page count
* Automatic retroactive updates to existing saved stories

**Dependencies before implementation:**

* `drift-log.md` Accepted entry
* Updates to `source-of-truth.md`, `character-bible.md`, `illustration-guide.md`, and `phase-b-architecture-map.md` (table + UI surfaces)
* Revision of architecture freeze (new table; generation pipeline change)

**Success signal:** Teachers can adjust official character appearance/personality text; new generations reflect saved profiles; illustration prompts use updated descriptors; existing workflow speed is not materially degraded.

---

# Bucket 2 — Experiments

Optional trials. Promote to Bucket 1 only after validation.

| Item | Hypothesis | Validation needed |
|------|------------|-------------------|
| Inline vocabulary editing | Teachers may want light vocab tweaks without full regenerate | Pilot: do teachers attempt vocab edits? Does regenerate suffice? |
| Richer pilot feedback capture | Structured in-app feedback may surface workflow issues faster | Facilitator trial: compare vs spreadsheet notes |
| Generation quality rubric | A simple post-generate checklist may improve perceived usefulness | Teacher session: time cost vs clarity gained |

Experiments must not change locked V1 defaults without an explicit drift-log decision.

---

# Bucket 3 — Future Possibilities

Parked ideas. **No implementation** unless moved to Bucket 2 or Bucket 1 with justification.

| Item | Why parked |
|------|------------|
| In-app image generation | Explicit V1 exclusion; external prompt workflow is sufficient for validation |
| Student / parent modes | Out of V1 user scope; different product surface |
| Multiple series support | Expands memory, character, and UI model beyond Nina & Nino validation |
| Export systems (PDF, print packs) | Not required for core workflow validation |
| Story deletion with memory reconciliation | Archive covers home-list clutter; hard delete + memory rules need separate design |
| Marketplace / collaboration | Explicit non-goals in source-of-truth |

---

# Maintenance

When an item moves buckets or ships:

1. Update this document (status + date)
2. Add or update [drift-log.md](before-coding/drift-log.md) entry
3. Update affected authority and architecture documents **before** code changes

When uncertain:

> Does this help teachers create stories faster without breaking the locked V1 baseline?

If not, keep it in Bucket 3 or defer.
