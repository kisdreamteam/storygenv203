# product-spec.md

# Product Specification

Version: 1.0

---

1. Product Definition

This product is a teacher-first web application that helps teachers create educational children's stories quickly.

The product generates:

Educational stories
Matching illustrations or illustration prompts
Vocabulary support

Long-term, the product may deliver generated illustrations. **V1 provides illustration prompts only** — copy-ready prompts teachers can use in external image tools.

The product also maintains shared story memory across generated stories to preserve continuity and reduce repetition.

Primary product goal:

Help teachers create usable educational stories quickly

---

# 2. Target User

Primary users:

* Kindergarten teachers
* Preschool teachers
* ESL / EFL teachers
* Early literacy teachers

V1 scope is **teachers only**. Parents acting as educators are out of scope for V1.

These users typically:

* Have limited preparation time
* Have low tolerance for complicated software
* Need classroom-ready materials quickly
* Prefer simple predictable workflows

The product is NOT optimized for:

* Students
* Parents acting as educators (out of V1 scope)
* Publishers
* Content creators
* Curriculum designers
* Large organizations

---

3. Problem Statement

Teachers need stories that align with:

Learning objectives
Vocabulary goals
Classroom themes
Previously created stories

Existing solutions frequently:

Require excessive setup
Generate generic content
Provide weak visual support
Forget previous stories
Create repetitive content over time

The product solves this problem by reducing the time required to create classroom-ready materials while maintaining continuity across stories.

---

4. Core User Workflow

Teacher opens application

↓

System loads Nina & Nino Series Memory

↓

Teacher provides minimal inputs

↓

Teacher clicks Generate

↓

System creates and saves the story automatically:

Story (12 pages, ~30–40 words per page)
Illustration prompts (one per page in V1)
Vocabulary support

Story appears on the home / recent stories list

Series Memory updates

↓

Teacher optionally edits page text, illustration prompts, or story setup inputs

↓

If the teacher made edits, they click Save story to commit those changes (updates Series Memory again)

↓

Teacher uses story in class

The workflow should feel:

Fast
Predictable
Low friction
Easy to understand

---

5. Definition of a Usable Story

A story is considered usable when ALL conditions are true:

Required:

Complete story exists (12 pages, ~30–40 words per page)
Matching illustration prompts exist (one per page in V1)
Vocabulary support exists
Story is understandable without heavy editing
Teacher could realistically use it in class tomorrow
Character continuity remains reasonably consistent
Story does not unintentionally duplicate previous stories

Teachers generate with **Monthly Topic + Learning Goal** as required inputs. **Story creation is two steps:** (1) **Suggest weekly plan** — AI proposes main-idea beats for empty weeks (or all four when none filled); (2) teacher reviews/edits all four weekly guidance fields; (3) **Generate** — only when every week has guidance. Optional **Week 1–4 guidance** (Main Events + Vocabulary per week) are brief hints, not full scripts. **Weeks are internal planning data — they must never appear in story text.** Post-generation validation enforces structure and week-language leak detection only.

Target Quality:

Appropriate for young learners
Educationally useful
Character continuity remains consistent
Classroom-friendly language
Reasonably coherent first draft quality

If these conditions are not met:

The story is not considered successful

---

# 6. Primary Success Metrics

Primary metric (soft target):

**Teacher reaches a usable first draft with minimal interaction time**

Interaction should require minimal clicks and typing. Total time including AI generation wait should *feel* fast, but is not a hard SLA. The under-2-minute figure is a guiding target, not a strict gate.

Secondary metrics:

* Minimal clicks required
* Minimal typing required
* Minimal setup required
* Low confusion during creation
* High first-generation usability
* Generation latency feels responsive

Measurement:

Start:

* Teacher lands on story creation flow

End:

* Generated story becomes visible

---

# 7. Product Philosophy

The product prioritizes:

1. Teacher-first decisions
2. Speed over configuration
3. Simplicity over flexibility
4. Generate first, refine later
5. Opinionated defaults
6. Small understandable systems

Rule:

**A fast imperfect story is more valuable than a perfect story that never gets created**

---

# 8. Product Assumptions

Assumptions:

* Teachers primarily create stories individually
* Teachers understand English
* Teachers have internet access
* Teachers are more likely to use desktop devices during preparation
* Teachers prefer faster generation over deeper customization
* V1 is accessed via a private hosted URL (not a public launch)

---

# 9. Product Boundaries

Features should be questioned when they:

* Increase setup complexity
* Increase friction
* Increase generation time
* Make workflows less predictable
* Reduce speed to first draft

Default decision:

**Choose the simpler option**

---

# 10. Decision Rule

When uncertainty exists:

Ask:

> Does this help teachers create stories faster?

If yes:

> Consider building it

If no:

> Do not build it yet

