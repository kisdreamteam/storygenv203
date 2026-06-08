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

Documents affected: drift-log.md, v1-scope.md, docs/phase-b-architecture-map.md, docs/teacher-pilot-test-plan.md

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

Documents affected: product-spec.md, source-of-truth.md, v1-scope.md, drift-log.md, docs/phase-b-architecture-map.md, docs/teacher-pilot-test-plan.md

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

Why change is needed: Production-quality character continuity across stories and illustration prompts; preserves original Nina & Nino appearance; supports future customization without implementing it now.

Documents affected: character-bible.md, illustration-guide.md, source-of-truth.md, drift-log.md

Decision: V1 locks official Nina & Nino character appearances and introduces a standardized illustration continuity system including 16:9 framing, zoomed-out compositions, full-body visibility, and reserved space for educational text overlays.

Status: Accepted

---

# 9. Current Open Decisions

Use this section for unresolved items.

(No open decisions at this time.)
