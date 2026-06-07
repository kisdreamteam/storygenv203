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

Character priority:

Tier 1:

* Nina
* Nino
* Core family members

Tier 2:

* Recurring supporting characters

Tier 3:

* Story-specific characters

Series Memory updates when:

* Story is saved

Series Memory does NOT update when:

* Draft exists
* Generation fails
* Story is deleted

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

* Illustration prompts only
* No in-app image generation in V1
* One illustration prompt per story page

## V1 Persistence (Locked)

* Series Memory and stories persist via Supabase
* localStorage is not the primary persistence model

## Story Structure (Locked)

* 12 pages default
* ~30–40 words per page
* Ages 4–6 readability

## V1 Edit Scope (Locked)

* Edit story text per page
* Regenerate story from edited inputs

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
4. Unresolved decisions belong in drift-log.md

---

# 7. Authority Order

Authority order:

product-spec.md

↓

source-of-truth.md

↓

v1-scope.md

↓

character-bible.md

↓

illustration-guide.md

↓

domain documents

↓

cursor rules

↓

implementation

Lower authority may extend.

Lower authority may NOT contradict.

**Locked V1 decisions:** When general language in `product-spec.md` conflicts with a locked V1 decision in this document, the locked V1 decision wins and `product-spec.md` should be updated to match.

---

# 8. Final Rule

When uncertain:

> Choose the simpler option

When debating features:

> Ask whether this helps teachers create stories faster

If not:

> Do not build it yet

