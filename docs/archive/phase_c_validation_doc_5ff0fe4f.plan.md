---
name: Phase C Validation Doc
overview: Create docs/phase-c-validation-before-coding.md — a validation-only document that walks the full teacher journey, audits ambiguities and complexity, checks cross-document consistency, and recommends "Proceed after minor doc edits" with 0 blocking issues for mock-first coding.
todos:
  - id: write-phase-c-doc
    content: Create docs/phase-c-validation-before-coding.md with all 8 required sections + appendix
    status: completed
  - id: journey-table
    content: Write 18-step teacher journey table with behavior, data, failure, clarity columns
    status: completed
  - id: ambiguity-missing-sections
    content: Write ambiguity check, complexity review, and missing decisions tables from pre-analysis
    status: completed
  - id: consistency-scenarios-recommendation
    content: Write cross-doc check, 5 validation scenarios, and final recommendation
    status: completed
  - id: verify-no-code
    content: Confirm no app files or production code created; only validation document
    status: completed
isProject: false
---

# Phase C: Validation Before Coding

## Deliverable

Create **[docs/phase-c-validation-before-coding.md](../phase-c-validation-before-coding.md)** — validation only. No production code, no app files, no architecture changes unless documenting a recommended doc fix.

---

## Pre-analysis findings (drives document content)

### Executive Summary (Section 1)

**Status: Mostly Ready**

| Question | Answer |
|----------|--------|
| Specs ready for coding? | Yes for mock-first build (architecture map steps 1–9). Minor doc gaps before real LLM + private deploy. |
| Core workflow clear? | Yes — 18-step journey maps cleanly to 4 routes and 5 tables. |
| Blocking ambiguities? | **0 blocking** for starting implementation with mocks. **2 non-blocking until step 10/13:** auth onboarding model, LLM provider. |
| Unnecessary complexity? | None identified — architecture is appropriately minimal. |
| Docs mostly agree? | Yes — one minor wording conflict already resolved in phase-b. |

### Known conflict (document in Section 6)

- [product-spec.md](../before-coding/product-spec.md) line 113: "Generated story updates Series Memory"
- [source-of-truth.md](../before-coding/source-of-truth.md) locked rule: updates on **save only**
- **Severity: Minor** — phase-b and drift-log already resolve; recommend one-line fix to product-spec.md

---

## Section 2: Teacher Journey Walkthrough

18-row table covering the exact journey from the user prompt. Key cells pre-filled:

| Step | Docs clear? | Notes |
|------|-------------|-------|
| 1–3 Visit URL, sign in, story list | Mostly | Auth method clear (Supabase); sign-up vs invite **unclear** |
| 4–6 New Story + inputs | Yes | 4 required + 4 optional per v1-scope |
| 7 Load Series Memory | Mostly | Timing: load before generate (architecture) vs on app open (product-spec) — same outcome, minor wording gap |
| 8–9 Generate + outputs | Yes | 12 pages, 12 prompts, vocabulary |
| 10–12 Review, edit page, regenerate | Mostly | Text edit locked; regenerate locked; prompt/vocab edit **not locked** |
| 13–14 Save + memory update | Yes | Save-only memory update well documented |
| 15–16 List + reopen | Mostly | List shows own stories; **draft visibility in list unclear** |
| 17–18 Second story + continuity | Yes | Global shared memory + compressed summaries |

Each row includes: Expected behavior, Required data, Possible failure, Docs clear (Yes / Mostly / No).

---

## Section 3: Ambiguity Check

Real ambiguities only (~12 items). Structure per item: Ambiguity, Why it matters, Best default, Blocks coding?, Doc to update.

| Ambiguity | Blocks? | Default | Update |
|-----------|---------|---------|--------|
| Sign-up vs invite-only | No (mock-first) | Invite-only email for private group | phase-b + drift-log |
| Drafts in story list | No | List shows `saved` only; drafts accessible via redirect after generate | phase-b |
| Draft survives refresh | No | Persist `draft` to Supabase (phase-b default) | phase-b (confirm as decision) |
| Failed generation | No | Show error, keep inputs, no story row or keep draft unchanged | v1-scope or phase-b |
| Regenerate replaces all pages | No | Full replace of pages, prompts, vocab | Already in phase-b |
| Story deletion in V1 | No | Exclude from V1 — no delete UI | v1-scope exclusions |
| Delete affects memory | N/A if no delete | Memory does not update on delete (source-of-truth) | — |
| Edit illustration prompts | No | Read-only + copy; regenerate for new prompts | illustration-guide already says optional |
| Edit vocabulary items | No | Read-only in V1; regenerate to change | phase-b edit scope |
| Story title source | No | Auto from theme (truncate/slug) | phase-b |
| Vocabulary count | No | 5–7 words per character-bible unless Notes override | character-bible (already stated) |
| Memory load failure | No | Generate with empty memory + static bible; warn teacher | phase-b |
| Global memory cross-teacher | No | Intentional; all teachers share continuity | phase-b |
| Save failure | No | Show error, remain on editor, draft preserved | phase-b |

---

## Section 4: Complexity Review

All items **Keep** for V1 — none warrant Simplify, Remove, or Defer:

| Item | Verdict | Rationale |
|------|---------|-----------|
| Supabase Auth | Keep | Required for private URL + per-teacher stories |
| Supabase persistence | Keep | Locked in source-of-truth |
| Global shared Series Memory | Keep | Validates continuity across teacher group |
| Draft persistence | Keep | Prevents lost work on refresh |
| Edit + regenerate | Keep | Locked edit scope |
| Illustration prompts | Keep | Core V1 output |
| Vocabulary support | Keep | Core V1 output |
| Story list | Keep | Required for reopen |
| 4 routes | Keep | Minimal per architecture freeze |
| 5 tables | Keep | No over-engineering |
| Cursor rules (6 files) | Keep | Lightweight guardrails, no runtime cost |

---

## Section 5: Missing Decisions

~14 decisions with recommended simple defaults (table format). Highlights:

- **Auth:** Supabase email/password; invite-only sign-up disabled in Supabase dashboard
- **Drafts in list:** No — saved stories only on `/`
- **Draft auto-save:** Yes — persist to DB on generate (status `draft`)
- **Delete stories:** No delete in V1
- **Edit prompts/vocab:** No manual edit — copy prompts; regenerate for changes
- **Title:** Generated from theme
- **Vocab count:** 5–7 words (character-bible)
- **Generation fail:** Error message + retry; no memory update
- **Memory load fail:** Proceed with empty memory; log warning
- **Save fail:** Error toast; stay on page; data retained

Each row: Decision needed, Recommended default, Reason, Document to update.

---

## Section 6: Cross-Document Consistency

| Pair | Issue | Severity | Fix |
|------|-------|----------|-----|
| product-spec vs source-of-truth | Memory update timing wording | Minor | Update product-spec line 113 to "Saved story updates Series Memory" |
| source-of-truth vs v1-scope | Aligned | — | No fix |
| v1-scope vs phase-b | Aligned | — | No fix |
| character-bible vs illustration-guide | Aligned — bible descriptors in prompts | — | No fix |
| drift-log vs current | Says "no open decisions" but phase-b lists undecided auth/drafts | Minor | Add Accepted entries for phase-b defaults OR note phase-c resolutions |
| Cursor rules vs source docs | Aligned — rules reflect authority order and frozen architecture | — | No fix |

**No blocking conflicts.**

---

## Section 7: Validation Scenarios

Five scenarios with Setup, Steps, Expected result, Failure meaning:

1. **First story generation** — new teacher, empty memory, 4 inputs, receives 12 pages + prompts + vocab
2. **Second story continuity** — after first save, second story references Nina/Nino and prior setting subtly
3. **Repetition avoidance** — same theme twice; second story varies plot structure per memory
4. **Teacher override** — Notes + Main Events contradict memory; teacher inputs win
5. **Save and reopen** — save updates memory; reopen from list shows exact saved content

---

## Section 8: Final Recommendation

**Proceed after minor doc edits**

**Top 3 fixes before coding:**
1. Fix product-spec.md line 113 memory-update wording
2. Lock phase-b defaults into drift-log (auth invite-only, draft visibility, draft persistence)
3. Add brief error-behavior notes to phase-b (generation fail, memory load fail, save fail)

**Top 3 NOT to worry about yet:**
1. LLM provider choice (mock-first is acceptable per v1-scope)
2. Prompt/vocabulary manual editing (regenerate is sufficient)
3. Story deletion, export, image generation

---

## Document structure

```markdown
# Phase C: Validation Before Coding
Version, purpose, source list
## 1. Executive Summary
## 2. Complete Teacher Journey Walkthrough (18-row table)
## 3. Ambiguity Check (~12 items)
## 4. Complexity Review (Keep/Simplify/Remove/Defer table)
## 5. Missing Decisions (~14 items)
## 6. Cross-Document Consistency Check
## 7. Validation Scenarios (5)
## 8. Final Recommendation
## Appendix: Readiness Scorecard
```

Include mermaid for journey (optional, one diagram max) — reuse phase-b flowchart style.

---

## What will NOT be created

- Application code or Supabase migrations
- Changes to spec files (only **recommend** fixes in validation doc)
- New features or scope expansion
- Changes to the plan file

---

## Post-creation summary (for user message)

After implementing the doc, report:
1. Overall readiness: **Mostly Ready**
2. Blocking issues: **0** (for mock-first coding)
3. Minor doc edits recommended: **3–5**
4. Coding can start: **Yes, after optional minor doc edits; mock-first path is clear**
