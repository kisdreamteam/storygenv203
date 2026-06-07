# Illustration Guide

Version: 1.0

Purpose:

This document defines how illustration prompts are written for the Nina & Nino series in V1.

V1 delivers **illustration prompts only** — no in-app image generation. Prompts must be consistent, copy-ready, and aligned with [character-bible.md](character-bible.md).

Authority: Below [character-bible.md](character-bible.md).

---

# 1. V1 Illustration Model

## What V1 provides

* One illustration prompt per story page (12 prompts per story)
* Prompts displayed in the UI with a copy button
* Prompts teachers can paste into external image tools (e.g., Midjourney, DALL·E, Ideogram, manual illustration briefs)

## What V1 does NOT provide

* In-app image rendering
* Automatic image upload or storage
* Image editing inside the product

Rule: **A good prompt teachers can use elsewhere is a successful V1 illustration output.**

---

# 2. Visual Style (Locked for V1)

## Overall look

* Warm, child-friendly, educational illustration style
* Soft flat or gentle painterly digital illustration (not photorealistic)
* Bright but not neon palette
* Clean uncluttered compositions with one clear focal action per page
* Safe, welcoming environments suitable for ages 4–6

## Style suffix (append to every prompt)

Use this consistent suffix unless a story Note specifies otherwise:

> Children's book illustration, warm soft colors, simple shapes, friendly expressions, clean background, ages 4-6, no text in image

## Aspect and framing

* Default: single scene, landscape-friendly composition
* Characters large enough for young children to recognize expressions
* Background supports the scene but does not overpower characters

---

# 3. Character Consistency Rules

Every prompt that includes a character must use descriptors from [character-bible.md](character-bible.md) section 12.

Rules:

* Tier 1 characters use their locked appearance descriptors
* Tier 2 characters use their locked descriptors when present
* Tier 3 characters get a one-line stable descriptor when introduced
* Clothing changes must match the story text for that page
* Do not invent new permanent visual traits for established characters
* Biscuit appears only when the story mentions Biscuit

If a character is not on the page:

* Do not include them in the prompt
* Focus on setting, objects, or remaining characters only

---

# 4. Per-Page Prompt Format

Each illustration prompt should follow this structure:

```
[Scene action from page text]. [Characters present with bible descriptors]. [Setting details]. [Mood/lighting]. Children's book illustration, warm soft colors, simple shapes, friendly expressions, clean background, ages 4-6, no text in image.
```

## Template fields

| Field | Required | Notes |
|-------|----------|-------|
| Scene action | Yes | One clear moment from the page text |
| Characters | If present | Use bible quick-reference descriptors |
| Setting | Yes | Home, classroom, park, etc. — match story |
| Mood/lighting | Yes | e.g., sunny morning, cozy evening, gentle rain |
| Style suffix | Yes | Locked suffix from section 2 |

## Example (page with Nina and Nino at the park)

```
Nina and Nino sit on a wooden bench feeding breadcrumbs to ducks at a small pond. Nina is a 6-year-old girl with medium-brown skin, dark curly hair in two puffs, yellow shirt, blue overalls, red sneakers. Nino is a 4-year-old boy with medium-brown skin, short curly dark hair, green shirt, tan shorts, blue sneakers. Sunny neighborhood park with green grass and a paved path. Bright cheerful morning light. Children's book illustration, warm soft colors, simple shapes, friendly expressions, clean background, ages 4-6, no text in image.
```

---

# 5. Page-to-Prompt Mapping

* Exactly **one prompt per story page** (12 total)
* Prompt must depict the primary visual moment of that page's text
* Do not combine multiple pages into one prompt
* Do not preview future plot events not yet stated on that page
* If a page is dialogue-heavy, show the speakers and a relevant prop or gesture

---

# 6. Series Memory in Prompts

When Series Memory provides context:

* Reuse established settings with consistent details (e.g., Sunny Grove Kindergarten reading corner)
* Include recurring Tier 2 characters only when the story includes them
* Subtle callbacks are allowed (same park bench, same kitchen table) when continuity applies
* Do not force callbacks that confuse the current story

Teacher inputs override memory-based visual choices.

---

# 7. Do / Don't

## Do

* Keep prompts copy-ready in one paragraph
* Use concrete visual nouns children can point to (ball, cup, tree, book)
* Show clear facial expressions matching the story mood
* Depict cooperation, curiosity, and gentle problem-solving
* Match weather, time of day, and clothing to story text
* Leave space in the composition for classroom projection readability

## Don't

* Include text, labels, speech bubbles, or words in the image
* Use scary shadows, monsters, injuries, or crying as the focal emotion unless the story resolves it on the same page
* Add characters not present in the page text
* Use photorealistic, cinematic, or adult-targeted styles
* Add brand logos, copyrighted characters, or pop culture figures
* Overcrowd the scene with more than one primary action

---

# 8. Setting Reference Prompts

Reuse these setting anchors for consistency:

**Home kitchen:** Cozy kitchen with wooden table, fruit bowl, window with daylight, warm tones

**Sunny Grove Kindergarten:** Bright classroom, colorful cubbies, reading corner rug, bulletin board

**Neighborhood park:** Green grass, wooden bench, small pond with ducks, paved path, trees

**Market Street:** Friendly outdoor market stall with colorful fruit, striped awning, cheerful daylight

Adjust only when story text or teacher Notes specify a different location.

---

# 9. Vocabulary and Learning Goals in Prompts

When a page introduces target vocabulary:

* Show the object or action being learned when possible
* Do not write the vocabulary word as text in the image
* Let the visual reinforce the word the story text already uses

Example: If the target word is "basket," show Nina holding a woven basket — do not render the word "basket" in the image.

---

# 10. V1 UX Requirements

The product UI should:

* Display the prompt below or beside each story page
* Provide a one-click copy button per prompt
* Keep prompts readable without truncation (wrap or expand)
* Not require teachers to edit prompts for basic usability (editing prompts is optional)

Acceptable V1 shortcut:

* Teachers copy prompts manually into external tools
* No preview image required in the app

---

# 11. Quality Checklist

A prompt is acceptable when:

* [ ] Matches the page text's primary scene
* [ ] Uses correct character descriptors from the bible
* [ ] Includes the locked style suffix
* [ ] Contains no text-in-image instruction violations
* [ ] Is age-appropriate and classroom-safe
* [ ] Is copy-ready as a single paragraph
* [ ] Does not contradict Series Memory or teacher inputs

---

# 12. Future Scope (Not V1)

The following are explicitly out of V1 scope:

* In-app image generation APIs
* Stored generated images in Supabase
* Image regeneration per page inside the product
* Style picker or multiple illustration styles

If added later, update this guide and [source-of-truth.md](source-of-truth.md) first.

---

# 13. Final Rule

When uncertain about a visual decision:

> Choose the simpler, warmer, more child-friendly composition.

If illustration behavior would change workflow, outputs, or persistence:

> Update documentation first, then implement.
