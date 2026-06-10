# Character Editing Decision Record

Status: Phase 1 implemented (2026-06-10); Phase 2/3 documented only — not approved for implementation

Purpose:

Define how character editing should evolve after V1 without breaking the original V1 baseline.

**Authority:** This document records product direction only. It does not override [docs/before-coding/source-of-truth.md](before-coding/source-of-truth.md), [docs/before-coding/character-bible.md](before-coding/character-bible.md), or locked V1 behavior until authority documents are explicitly updated.

---

## 1. Global Default Character Profiles

**Decision:**

The app should eventually support editable global default character profiles.

**Rules:**

* Official characters start from the locked Character Bible defaults.
* The user may edit global default profiles later.
* Global edits affect future generations.
* Global edits do not automatically rewrite old stories.
* A reset-to-default option must exist.

**Reset requirements:**

* Reset one character
* Reset all characters
* Restore original factory defaults

---

## 2. Series Scope

**Decision:**

Do not implement series-level character profiles yet.

**Reason:**

The current product still uses one shared Nina & Nino series only.

**Future note:**

If multiple series are added later, character profiles may become series-scoped.

---

## 3. Story-Specific Overrides

**Decision:**

Story-specific character adjustments should eventually be allowed, but hidden by default.

**Examples:**

* Nina wears a beach hat in this story.
* Nino wears rain boots in this story.
* Mom carries a picnic basket in this story.

**Rules:**

* Story-specific overrides apply only to the current story.
* They do not change the global default profile.
* They should be stored with the story setup or story generation inputs.
* They should be used in story text and illustration prompts for that story only.
* They should not create copy-to-other-story behavior yet.

---

## 4. Teacher-Created / Story-Introduced Characters

**Decision:**

New recurring characters introduced in stories should eventually be saved as character profiles.

**Example:**

If a story introduces a doctor, future doctor stories should try to reuse the same doctor unless the user says otherwise.

**Rules:**

* New characters may be detected from generated stories.
* Important recurring characters may be added to the character database later.
* Perfection is not required.
* The goal is useful continuity, not perfect character memory.
* Initial implementation should focus on official characters first.
* New character persistence should come after official editable profiles work.

---

## 5. Recommended Implementation Order

### Phase 1 — Official Editable Characters

Status: **Shipped 2026-06-10**

* [x] Create editable global profiles for official characters (`character_profiles` table + seed)
* [x] Add reset-to-default (one character, all characters)
* [x] Use saved profiles in story generation
* [x] Use saved profiles in copy-assembled illustration prompts
* [x] Edit Characters UI on `/stories` (modal, Save, unsaved-changes guard)

### Phase 2 — Story-Specific Overrides

Status: Documented, not build yet

* [ ] Add hidden story-level character adjustments
* [ ] Store overrides with the current story
* [ ] Apply overrides only during that story generation

### Phase 3 — Story-Introduced Characters

Status: Documented future direction

* [ ] Detect new recurring characters
* [ ] Save selected new characters to database
* [ ] Reuse them in future relevant stories
* [ ] Allow later editing if needed

---

## 6. Current Implementation Boundary

Phase 1 is **implemented**. Do not expand into Phase 2 or Phase 3 without a new drift-log entry and authority doc updates.

Phase 2 (story-specific overrides) and Phase 3 (teacher-created / story-introduced character persistence) remain **documented future directions only** — not approved for implementation.
