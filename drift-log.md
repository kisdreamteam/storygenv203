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

# 9. Current Open Decisions

Use this section for unresolved items.

(No open decisions at this time.)
