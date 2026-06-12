# source-of-truth.md

# Source of Truth

Version: 1.0

Purpose:

This document defines locked decisions and product truths.

These rules exist to reduce drift.

If implementation conflicts with documentation:

**Documentation wins**

If documentation conflicts:

**Higher authority wins**

---

# 1. Product Identity (Locked)

This product is:

* Teacher-first educational story generation software
* Optimized for fast story creation workflows
* Designed for creating usable first drafts quickly

This product is NOT:

* A curriculum platform
* A student platform
* A lesson planning system
* A publishing platform
* A social platform
* A marketplace
* A classroom management system

---

# 2. Core Product Goal (Locked)

Single product goal:

**Help teachers create usable educational stories quickly**

Primary success metric (soft target):

**Teacher reaches a usable first draft with minimal interaction time**

Interaction should require minimal clicks and typing. Total time including AI generation wait should feel fast, but is not a hard SLA. The under-2-minute figure is a guiding target, not a strict gate.

When uncertain:

> Does this help teachers create stories faster?

If not:

> Question it.

---

# 3. Locked Product Philosophy

Always prioritize:

1. Speed over configuration
2. Simplicity over flexibility
3. Generate first, refine later
4. Opinionated defaults over excessive options
5. Small scope over feature growth

Default decision:

**Choose the simpler option**

---

# 4. Locked Product Decisions

These decisions are considered locked unless explicitly changed.

## Audience

* Teachers only
* Teacher-first workflows
* Parents acting as educators are out of V1 scope

## Age Range

* Ages 4–6 only

## Language

* English only

Future languages:

* Korean (KR)
* Vietnamese (VI)

Rules:

* English remains default
* New languages extend workflows
* New languages do not redesign workflows

## Story Series

* Nina & Nino only
* Single shared series only

Rules:

* All generated stories contribute to shared series memory
* New stories automatically use previous stories as context
* Teachers should not manually manage series selection in V1

## Series Memory (Locked)

Series Memory exists to maintain continuity across stories.

Series Memory should track:

* Characters
* Character appearance rules
* Character relationships
* Story history
* Themes
* Settings
* Events
* Vocabulary history
* Repetition patterns

Series Memory should prioritize:

1. Core continuity entities
2. Recent story history
3. Relevant story history
4. Compressed older history

Generation should NOT require loading all previous stories in full.

Generation should attempt to:

* Maintain continuity
* Reduce accidental repetition
* Encourage language variety

Teacher instructions override continuity rules.

Continuity should guide generation.

Continuity should not block generation.

## V1 Character Continuity (Locked)

V1 locks official Nina & Nino character appearances in [character-bible.md](character-bible.md).

Purpose:

* Keep core characters visually identical across stories
* Improve illustration prompt consistency
* Preserve the original Nina & Nino appearance used in earlier stories
* Support future character customization without implementing it in V1

Rules (historical V1 baseline — frozen at original V1 ship):

* Official locked characters: Nina, Nino, Mom, Dad, Grandpa, Ms. Lee
* Teachers could not edit character profiles in frozen V1
* Locked clothing, hair, and facial appearance remain the same across all stories unless a teacher Note requests a one-story exception
* Mom always wears the yellow áo dài
* Teacher-introduced characters (friends, classmates, visitors) may appear in stories but are not persisted as character profiles

**Post-V1 update:** Editable Characters **Phase 1** is implemented (2026-06-10). Teachers may edit global default appearance and personality for the six official characters via the Edit Characters modal. Factory defaults remain in [character-bible.md](character-bible.md); reset restores them. Phase 2/3 (story overrides, teacher-created character persistence) remain deferred — see [Post-V1 Character Editing](#post-v1-character-editing-approved-future-phase-1) below.

Character priority:

Tier 1 (locked official):

* Nina
* Nino
* Mom
* Dad
* Grandpa
* Ms. Lee

Tier 2 (recurring, not locked):

* Supporting characters such as Sam and Biscuit — suggested descriptors only

Tier 3 (story-specific):

* Teacher-introduced or one-story characters — generated when needed; not persisted as profiles

## Post-V1 Character Editing (Phase 1 — Implemented)

The V1 character rules above remain the **historical baseline**. Post-V1 **Phase 1** is **implemented** per [docs/character-editing-decision-record.md](../character-editing-decision-record.md) and drift-log entry (2026-06-09).

**Shipped behavior (Phase 1 — 2026-06-10):**

* Official characters still **start from** [character-bible.md](character-bible.md) factory defaults; reset restores factory values
* Teachers edit global default **appearance** and **personality** for Nina, Nino, Mom, Dad, Grandpa, Ms. Lee via **Edit Characters** on `/stories` (modal only; no new route)
* Saved profiles in `character_profiles` override factory defaults during **future** story generation and copy-assembled illustration prompts
* **Reset-to-default:** reset one character, reset all characters (with confirm)
* **Unsaved-changes guard:** switching characters or closing the modal with unsaved edits prompts Save, Discard, or Cancel
* Global profile edits affect **future generations only** — they do not automatically rewrite old saved stories

**Still deferred (Phase 2/3 — not approved for implementation):**

* Series-scoped character profiles
* Story-specific character overrides (hidden story-only adjustments)
* Teacher-created / story-introduced character persistence in the database

Series Memory updates when:

* Generate completes successfully (story auto-saved)
* Regenerate completes successfully (story auto-saved)
* Teacher commits later edits via Save story (page text, illustration prompts, or setup changes that were applied)

Series Memory does NOT update when:

* Generation or regeneration fails (including AI output validation failure — no mock/template save)
* Teacher edits page text or prompts but has not clicked Save story yet
* Teacher edits story setup inputs only (pages unchanged until Regenerate)

When a story is archived (soft delete from the home list), Series Memory is **rebuilt from all active saved, non-archived stories** so the archived story no longer influences future generation. Archive does not append to memory — it removes the archived story's influence. Hard delete is not part of V1.

Teachers may intentionally override continuity.


## Story Rules

Generated stories should prioritize:

* Educational usefulness
* Age appropriateness
* Vocabulary support
* Readability
* Classroom usability

Educational usefulness is prioritized over creativity alone.

## V1 Deployment (Locked)

* Private hosted URL for validation
* Not public launch; small trusted teacher group

## V1 Illustrations (Locked)

* Illustration prompts only (no in-app image generation in V1)
* One short **illustration scene** per story page stored in `illustration_prompt` (10–50 words; editable in UI)
* Full copy-ready production prompts assembled only on **Copy prompt** / **Copy Illustrations** from character profiles + scene + setting/mood + locked style suffix (see [illustration-guide.md](illustration-guide.md))
* Official V1 illustration framing: 16:9 landscape, zoomed-out composition, full-body characters visible, extra empty space for educational text overlays, no text/speech bubbles/labels/watermarks in image
* Locked character descriptors from [character-bible.md](character-bible.md) / `character_profiles` on every official character in copy-assembled prompts

## V1 Persistence (Locked)

* Series Memory and stories persist via Supabase
* localStorage is not the primary persistence model

## Story Structure (Locked)

* 12 pages default
* ~30–40 words per page
* Ages 4–6 readability

## V1 Edit Scope (Locked)

* Edit story text per page
* Edit illustration scenes per page (stored in `illustration_prompt` column)
* Edit story setup inputs (theme, learning goal, vocabulary focus, main events, optional fields)
* Regenerate story from stored setup inputs (replaces pages, prompts, and vocabulary; auto-saves)
* Save story — commit later edits only; not required after first generation

---

# 5. Locked Anti-Drift Rules

These must NOT drift accidentally:

* Teacher-first philosophy
* Fast generation workflow
* Soft under-2-minute interaction goal
* Minimal setup philosophy
* Small scope philosophy
* English-first generation
* Nina & Nino continuity
* Locked official character appearances (Nina, Nino, Mom, Dad, Grandpa, Ms. Lee)
* V1 illustration continuity suffix and 16:9 framing standard
* Series Memory continuity
* V1 illustration prompts only (no in-app image generation)
* Supabase persistence for stories and Series Memory

STOP implementation if changes affect:

* User workflow
* Required inputs
* Outputs
* Success metrics
* Product philosophy
* Product boundaries
* Series Memory behavior

Update documentation first.

Then continue implementation.


---

# 6. Conflict Resolution Rules

When documents conflict:

1. Higher authority wins
2. Lower authority documents must update
3. Implementation may NOT resolve conflicts
4. Unresolved decisions belong in [drift-log.md](drift-log.md)

---

# 7. Authority Order

Authority order:

docs/before-coding/product-spec.md

↓

docs/before-coding/source-of-truth.md

↓

docs/before-coding/v1-scope.md

↓

docs/before-coding/character-bible.md

↓

docs/before-coding/illustration-guide.md

↓

domain documents (e.g. docs/phase-b-architecture-map.md)

↓

cursor rules

↓

implementation

Lower authority may extend.

Lower authority may NOT contradict.

**Locked V1 decisions:** When general language in `docs/before-coding/product-spec.md` conflicts with a locked V1 decision in this document, the locked V1 decision wins and `docs/before-coding/product-spec.md` should be updated to match.

**Supporting post-V1 documents:**

* [docs/product-roadmap.md](../product-roadmap.md) — strategic future direction
* [docs/roadmap-todo.md](../roadmap-todo.md) — tactical roadmap queue
* [docs/project-changelog.md](../project-changelog.md) — meaningful project history

These documents do not override `product-spec.md`, `source-of-truth.md`, `v1-scope.md`, `drift-log.md`, `character-bible.md`, or `illustration-guide.md`.

---

# 8. Final Rule

When uncertain:

> Choose the simpler option

When debating features:

> Ask whether this helps teachers create stories faster

If not:

> Do not build it yet

