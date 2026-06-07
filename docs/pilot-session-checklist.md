# Pilot Session Checklist

Version: 1.0

Purpose: Run teacher workflow validation sessions consistently. Documentation only — not product analytics, not a spec change.

Authority: [product-spec.md](../product-spec.md), [source-of-truth.md](../source-of-truth.md), [v1-scope.md](../v1-scope.md)

Related:

- [teacher-pilot-test-plan.md](teacher-pilot-test-plan.md) — briefing script, test scenario, feedback questions
- [workflow-validation-metrics.md](workflow-validation-metrics.md) — console events and what they mean

---

## Before Session

Complete this checklist before the teacher arrives.

- [ ] **Verify production deployment running** — app loads at the hosted URL; `/login` and home respond without errors
- [ ] **Verify login credentials available** — invited teacher email/password ready (do not share credentials in this repo)
- [ ] **Verify Supabase connected** — sign in once as facilitator; confirm home loads and a test generate/save works if needed
- [ ] **Open browser console** — DevTools (F12) → Console tab on the machine the teacher will use
- [ ] **Filter console for `StoryGen:pilot`** — use console filter so pilot events are easy to spot
- [ ] **Open note-taking document** — session log with teacher name, date, facilitator name
- [ ] **Prepare timer** — phone or stopwatch for wall-clock timing (console events supplement, not replace)

**Facilitator prep (optional but recommended)**

- [ ] Re-read [teacher-pilot-test-plan.md](teacher-pilot-test-plan.md) §2 briefing and §3 scenario
- [ ] Confirm teacher received briefing (template wording, mock limitation, ~10–15 minutes)

---

## During Session

### Rules

- **Do not guide immediately** — let the teacher read and explore first
- **Let teacher hesitate first** — silence is data; note where they pause
- **Record hesitation duration** — approximate seconds before they click, type, or ask
- **Record exact wording when confused** — quote what they say, not your interpretation
- **Observe clicks before helping** — note what they tried (wrong button, scroll, back link) before intervening
- **Avoid explaining prototype limitations too early** — only clarify mock/template wording if it blocks progress or after they notice it

**Intervene only when blocked:** login failure, persistent error message, or complete inability to proceed after reasonable hesitation.

### Track

Use console `[StoryGen:pilot]` events plus facilitator notes.

| What to track | How |
|---------------|-----|
| **Time to first generate click** | Timer from session start (or post-login) → `story_generate_clicked` |
| **Time to first story visible** | Timer → `story_generate_completed` or first `story_page_opened` |
| **Time until save** | Timer → `story_save_completed` |
| **Whether second story created** | Look for `second_story_created` or `generateCount: 2` |
| **Where questions occur** | Step number + teacher’s exact words (create form, story page, save, home, second story) |

**Scenario steps** (for reference): sign in → New Story → fill four fields → Generate → review → edit page 1 → Save → reopen from home → second story. Full table in [teacher-pilot-test-plan.md](teacher-pilot-test-plan.md) §3.

**During-session quick checks**

- [ ] Teacher signed in without facilitator typing credentials
- [ ] Teacher reached create form without heavy prompting
- [ ] First generate completed (`story_generate_completed` in console)
- [ ] Teacher edited at least one page (blur save)
- [ ] Save completed (`story_save_completed` in console)
- [ ] Teacher reopened saved story from home (`story_reopened` in console)
- [ ] Second story generated OR teacher states they would create another

---

## After Session

Capture these while memory is fresh (within 30 minutes).

| Field | Notes |
|-------|-------|
| **Total time** | Wall clock from start to end of scenario |
| **Major confusion points** | Steps, UI labels, draft vs saved, optional fields, etc. |
| **Whether teacher would use again** | Yes / Maybe / No — and why in one sentence |
| **Top requested changes** | Up to three, in teacher’s words |
| **Whether requested changes conflict with V1 scope** | Compare each request to [v1-scope.md](../v1-scope.md) and [source-of-truth.md](../source-of-truth.md) |

**Post-session facilitator checklist**

- [ ] Console screenshot or copied `[StoryGen:pilot]` lines saved with session notes
- [ ] [teacher-pilot-test-plan.md](teacher-pilot-test-plan.md) §4 feedback questions asked (or written form sent)
- [ ] Observer checklist (§5 of test plan) filled in
- [ ] Out-of-scope requests tagged (images in app, delete UI, export, etc.) — not treated as blockers

---

## Session Success Criteria

A session is **successful** when:

- [ ] Teacher **generates without heavy assistance** — facilitator did not complete the form or click Generate for them
- [ ] Teacher **saves successfully** — `story_save_completed` or clear save action observed
- [ ] Teacher **reopens successfully** — opens saved story from home and sees prior content
- [ ] Teacher **understands workflow** — can describe sign in → create → generate → save → home in their own words (roughly)
- [ ] Teacher **creates multiple stories OR expresses confidence they could** — `second_story_created` in console, or explicit “I’d make another one”

A session can still be **valuable** if unsuccessful — hesitation and confusion are the primary data. Mark success honestly; do not coach to pass.

---

## Scope Protection

**Do NOT implement feedback immediately.**

Process:

```
Feedback
    ↓
Log feedback
    ↓
Compare against authority docs
    ↓
Look for patterns across multiple teachers
    ↓
Only then consider changes
```

**Reminders**

- Mock/template story quality is **expected** — not a workflow failure ([teacher-pilot-test-plan.md](teacher-pilot-test-plan.md) §6)
- Illustration **prompts only** in V1 — no in-app images ([illustration-guide.md](../illustration-guide.md))
- Home list shows **saved stories only** — drafts stay on story URL until Save
- No spec updates from a single session unless a request **clearly conflicts** with authority docs and must be recorded in [drift-log.md](../drift-log.md)

**Common out-of-scope requests** (log, do not build during pilot)

| Request | V1 stance |
|---------|-----------|
| Better / less repetitive AI wording | Deferred — real LLM not in pilot scope |
| Images inside the app | Excluded — external tools from prompts |
| Delete stories in UI | Excluded |
| Edit vocabulary inline | Read-only in V1 |
| Export PDF / print | Excluded |

---

## Session log template

Copy into your note-taking document:

```
Session: _______________
Date: _______________
Teacher: _______________
Facilitator: _______________

Before: deployment ✓  login ✓  supabase ✓  console filter ✓

Times:
- First generate click: ___ min
- First story visible: ___ min
- Save: ___ min
- Total: ___ min
- Second story: yes / no / n/a

Confusion (step + quote):
1.
2.

Would use again: yes / maybe / no —

Top requests:
1.
2.
3.

V1 scope conflicts: yes / no — notes:

Success criteria: generate / save / reopen / understands / multi-story

Console events captured: yes / no
```

---

*End of pilot session checklist.*
