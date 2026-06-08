# Teacher Pilot Test Plan

Version: 1.0

Purpose: Guide a small trusted teacher pilot for StoryGen V2 workflow validation. Documentation only — no product changes from this file.

Authority: [product-spec.md](../product-spec.md), [source-of-truth.md](../source-of-truth.md), [v1-scope.md](../v1-scope.md)

---

## 1. Pilot purpose

This pilot validates whether the **existing V1 teacher workflow** feels fast, understandable, and useful. It does **not** judge final story-writing quality.

**In scope**

- Workflow clarity: sign in → create → generate → review → edit → save edits → reopen
- Speed to first draft (clicks, typing, hesitation)
- Save and reopen understanding (auto-save on generate; Save story for edits; home list behavior)
- Create form simplicity (four required fields visible; optional fields behind “More options”)

**Out of scope for this pilot**

- Final AI story quality — mock/template generation is still active
- In-app images, export, student mode, analytics, or new product features

**Success for this pilot:** A teacher completes the test scenario without facilitator rescue, and feedback is logged for workflow improvements only.

---

## 2. Teacher briefing script

Copy and send this to teachers before the session (or read aloud at the start):

---

Welcome to the StoryGen early prototype.

This is a **private, invite-only** test of how fast and clear the story-creation workflow feels. You will sign in, enter a few details, generate a Nina & Nino story (it saves automatically), lightly edit one page, save your edit, and try a second story.

**Please know:**

- Story **wording may feel template-like** right now. Real AI generation is coming later.
- We want your feedback on **workflow, clarity, speed, and usefulness** — not on whether the app is finished.
- You will see **illustration prompts** with a copy button. V1 does not show images in the app; you would use prompts in an external image tool if you want pictures.
- The session takes about **10–15 minutes**. Bring a simple classroom theme in mind (e.g. sharing, kindness, visiting the fire station).

There is no right or wrong answer. Pause wherever you feel unsure — that is useful feedback.

---

## 3. Test scenario

Facilitator: observe quietly; help only if the teacher is blocked (login failure, error message).

| Step | Teacher action | What to expect |
|------|----------------|----------------|
| 1 | Sign in with invited account | Lands on home (saved stories list) |
| 2 | Click **New Story** | Create form with four required fields |
| 3 | Fill **Theme**, **Learning Goal**, **Vocabulary Focus**, **Main Events** | Optional fields are under **More options** — not required |
| 4 | Click **Generate** | Redirect to story page with 12 pages, vocabulary, illustration prompts; story already saved and on home list |
| 5 | Scroll and review output | Prototype note visible; wording may feel repetitive |
| 6 | Edit **page 1** text; click/tab away | Page saves on blur (“Saved” feedback); **Save story** becomes enabled |
| 7 | Click **Save story** | Commits your edit; returns to home |
| 8 | Click the story card on home | Reopens same story with edited page 1 text |
| 9 | Click **New Story** again | New create form |
| 10 | Create a **second story** with a different theme; Generate | Page 1 should reference the prior story (e.g. “Nina and Nino remember…”) |

**Observer note:** Generated stories appear on home immediately after Generate. **Save story** is only needed after the teacher edits page text, prompts, or setup inputs.

---

## 4. Feedback questions

Ask after the scenario (conversation or short written form). Do **not** ask teachers to rate AI writing as production-ready.

1. What felt easy?
2. Where did you pause or feel unsure?
3. Did the create form feel short or long?
4. Were the field labels clear?
5. Did **Save story** make sense as a way to commit your edits (not as a first step after Generate)?
6. Could you imagine using this story after light editing?
7. Were **vocabulary** and **illustration prompts** useful?
8. Did the **second story** feel connected enough?
9. What **one thing** would make this faster?
10. (Optional) Was anything confusing about when **Save story** is needed?

---

## 5. Observer checklist

Session: _______________  Teacher: _______________  Facilitator: _______________

- [ ] Teacher generated without help
- [ ] Teacher hesitated on required fields (note which: _______________)
- [ ] Teacher understood story appears on home after Generate
- [ ] Teacher found Save story after editing
- [ ] Teacher reopened story successfully
- [ ] Teacher edited one page successfully
- [ ] Teacher noticed prototype/mock limitation
- [ ] Teacher asked for excluded features (note: _______________)

**Optional notes**

- Time to first draft: _______________ minutes
- Clicks to first draft (approx.): _______________
- Memorable quotes: _______________

---

## 6. Scope guard

After the pilot:

1. **Do not** implement new features from feedback immediately.
2. **Log** all feedback first (spreadsheet, notes, or future drift-log entry).
3. **Compare** every request against [source-of-truth.md](../source-of-truth.md) and [v1-scope.md](../v1-scope.md).
4. **Only implement** changes that improve faster story creation. Use the test: *Does this help teachers create stories faster?*

**Deferred by design (not pilot blockers)**

- Real LLM generation (architecture step 10)
- In-app image generation
- Export (PDF, print, download)
- Student or parent mode
- Analytics, payments, activities, worksheets

**Common feedback — how to handle**

| Feedback | Response |
|----------|----------|
| Stories sound repetitive / template-like | Expected with mock pipeline; not a workflow failure |
| Add images in the app | V1 exclusion — prompts + external tools only |
| Delete old stories | Use X on home story card to archive (removes from list) |
| Edit vocabulary inline | V1 read-only; regenerate for new vocab |
| Show drafts on home | Not needed — Generate auto-saves to home list |

---

## 7. Quick reference

| Item | Detail |
|------|--------|
| Login | `/login` — facilitator provides invited email/password (do not share in this repo) |
| Home | `/` — saved stories only |
| New story | `/stories/new` — four required fields |
| Story viewer | `/stories/[id]` — edit pages, Edit Story Setup, Regenerate, Save story (edits only) |
| Characters | Nina & Nino series ([character-bible.md](../character-bible.md)) |
| Illustrations | Prompts only ([illustration-guide.md](../illustration-guide.md)) |
| Pilot success | Full scenario completed without facilitator rescue |

---

*End of teacher pilot test plan.*
