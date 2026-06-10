# v1-scope.md

# V1 Scope

Version: 1.0

Purpose:

This document defines what V1 includes.

If something is not required for validating the core workflow:

**Do not build it yet**

---

# 1. V1 Purpose

This V1 exists primarily for:

* Learning
* Workflow validation
* Product validation
* Architecture learning
* Understanding real teacher usage

V1 ships to a **private hosted URL** for workflow validation with a small trusted teacher group.

This V1 does NOT exist for:

* Public launch
* Scaling
* Enterprise readiness
* Future-proofing
* Solving future requirements

Rules:

* Learning > scalability
* Simplicity > completeness
* Working systems > perfect systems
* Small understandable systems > complex systems

---

# 2. Core Workflow Being Validated

The workflow V1 must validate:

Teacher opens application

↓

System loads Nina & Nino Series Memory

↓

Teacher enters minimal inputs

↓

Teacher clicks Generate

↓

System auto-saves story output (pages, prompts, vocabulary)

Story appears on home / recent stories list

Series Memory updates

↓

Teacher optionally edits page text, illustration scenes, or story setup inputs

↓

If edited, teacher clicks Save story to commit changes (updates Series Memory)

Regenerate replaces content from stored setup inputs and auto-saves

↓

Teacher reopens story later

↓

Teacher may archive a saved story from the home list (removes it from the list; soft delete via `is_archived`)

If this workflow fails:

V1 fails

---

# 3. Required Inputs

Teachers should generate stories with minimal setup.

Required:

* Theme / Topic
* Learning Goal
* Vocabulary Focus
* Main Events

Optional:

* Setting
* Tone
* Words to avoid
* Notes

Rule:

**Teachers should generate using roughly four required inputs**

---

# 4. Required Outputs

Generation must provide:

Required:

Story pages (12 pages, ~30–40 words per page)
Illustration scenes (one short scene per page, stored and editable; full copy-ready production prompts assembled on copy for external image tools)
Vocabulary support / flashcards
Continuity-aware generation

Generation should attempt to:

Reuse established characters correctly
Avoid excessive story repetition
Encourage language variation

Acceptable additions:

Teacher notes
Teaching focus
Copy buttons

Not required:

Activities
Worksheets
Export systems
Audio
Student mode
Sharing systems


# 5. Required Functional Systems

These systems MUST work.

Story Creation
Setup flow
Generation flow
Loading states
Error handling
Story Management
Auto-save on generate and regenerate
Save story (commit later edits only)
Reopen stories
Edit stories (page text, illustration scenes, setup inputs + regenerate)
Story persistence (Supabase — persist, reopen, edit across sessions)
Illustration Prompts
Short scene generation per page (stored in `illustration_prompt`)
Show/hide scene in UI; copy assembles full production prompt
No in-app image generation
Series Memory
Generated stories persist via Supabase
Previous stories are retrievable
Generation can access story history
Character continuity persists
Shared Nina & Nino memory exists
---

# 6. Acceptable Shortcuts

Allowed:

* Mock data
* Fixture stories
* AI fallback stories
* Placeholder exports
* Manual workflows
* Temporary duplication
* Fake loading states
* Full production illustration prompts copied externally for manual image creation (assembled on copy from stored scenes)

Allowed manually:

* Copying outputs
* Creating images from prompts in external tools
* Sharing externally

Not allowed as primary persistence:

* localStorage as the main story or Series Memory store (Supabase is required)

Rule:

**Shortcuts are acceptable if core workflow remains valid**

---

# 7. Explicit Exclusions

Do NOT build:

* Student accounts
* Classroom systems
* Marketplace systems
* Collaboration systems
* Social systems
* Multiple series support
* Curriculum mapping
* Complex editing systems
* Advanced customization
* Enterprise infrastructure
* Analytics
* Payments
* Activities generation
* Roleplay systems
* Mobile-first optimization
* In-app image generation
* Public launch
* localStorage-as-primary persistence
* Parent / non-teacher user flows

Question every feature:

> Does this reduce time-to-first-story?

If not:

> Exclude it

---

# 8. V1 Completion Criteria

V1 is complete when:

Teachers create stories quickly
Generated stories appear on home automatically
Teachers commit later edits via Save story when needed
Teachers reopen stories
Teachers edit stories (page text, illustration scenes, setup inputs; regenerate from stored inputs)
Illustration scene + copy workflow works sufficiently
Continuity remains acceptable
Story repetition remains acceptable
Workflow feels simple
Architecture remains understandable

Performance criteria (soft target):

Minimal clicks and typing to reach first draft
Generation latency feels responsive (not a hard SLA)
Minimal setup required
No confusing flows

Validation test:

A teacher unfamiliar with the app should create multiple stories that feel connected during one coffee break

---

# 9. What Can Ship Broken

Acceptable:

* Export systems
* Prompt quality improvements
* Nice-to-have UX polish
* Placeholder functionality
* Mock implementations

Not acceptable:

* Broken generation flow
* Broken save system
* Broken reopen flow
* Confusing workflow
* Slow creation experience

Rule:

**Protect the core workflow. Everything else is negotiable**

---

# 10. Final Scope Rule

Before building ask:

> Does this validate the core workflow?

If YES:

> Consider building

If NO:

> Do not build yet

---

# 11. Post-V1 Evolution

The original V1 definition phase is complete. The project is entering a **controlled evolution** phase.

This section does **not** change what V1 was. Sections 1–10 above remain the **historical baseline** for what V1 included, excluded, and validated.

**How future work is managed:**

Post-V1 work is tracked in:

* [docs/product-roadmap.md](../product-roadmap.md) for strategic buckets
* [docs/roadmap-todo.md](../roadmap-todo.md) for tactical next steps
* [docs/project-changelog.md](../project-changelog.md) for meaningful project changes

* New features listed in the roadmap do **not** automatically become committed work
* **Bucket 1** items (Core Product Evolution) may be implemented incrementally after documentation and drift-log updates
* **Bucket 2** items (Experiments) require validation before promotion to Bucket 1
* **Bucket 3** items (Future Possibilities) remain parked until justified and reclassified

**Rules that still apply:**

* V1 locked decisions in [source-of-truth.md](source-of-truth.md) remain in force until explicitly revised
* Implementation must not silently expand scope — document first, then build
* The core teacher workflow (create → generate → optional edit → save/reopen) remains the center of gravity

When evaluating any post-V1 item, ask:

> Does this improve the existing workflow without turning StoryGen into a different product?

If unclear, keep it in Bucket 2 or Bucket 3 until validated.
