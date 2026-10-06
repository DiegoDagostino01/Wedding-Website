---
target: The Day section
total_score: 25
p0_count: 1
p1_count: 2
timestamp: 2026-07-03T09-03-28Z
slug: diego-bethany-wedding-html-details
---
Method: dual-agent (A: isolated Explore sub-agent · B: detector run in parent — sub-agent lacked terminal tools)
⚠️ DEGRADED: Assessment B's deterministic detector ran in the parent context because the Explore sub-agent had no terminal access. Assessment A ran fully isolated and finished before any detector output entered synthesis, so its judgment was not contaminated.

# Critique — "The Day" section (`#details`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | "Times are approximate", "address to follow", "details to follow" — the section broadcasts its own incompleteness instead of confirming the day. |
| 2 | Match System / Real World | 2 | Warm vocabulary is right, but a "Photo to come" placeholder sits where the real manor photo belongs; data feels provisional. |
| 3 | User Control and Freedom | 3 | No traps; scroll/nav work. But no "add to calendar" / save-itinerary affordance for a date guests must remember for a year. |
| 4 | Consistency and Standards | 3 | Consistent with the site's per-section eyebrow pattern, but the schedule grid (130px·1fr) and venue grid (1fr·1fr) share no visual language. |
| 5 | Error Prevention | 3 | Low-interaction static content; incompleteness is pre-disclosed so there are no surprise failures. |
| 6 | Recognition Rather Than Recall | 3 | Everything is on-page; but "address to follow closer to the date" defers info and asks guests to return later. |
| 7 | Flexibility and Efficiency | 2 | No shortcuts: no .ics export, no time-only quick reference, no way to hand the schedule to a travel companion. |
| 8 | Aesthetic and Minimalist Design | 2 | Three eyebrows in one section + a placeholder + label-in-card-in-section reads as scaffolding, not an invitation. |
| 9 | Error Recovery | 3 | No dead ends; real address lives in Travel. But if JS fails, `.reveal` leaves the whole section blank. |
| 10 | Help and Documentation | 2 | Disclaimers stand in for guidance; no "what garden-formal means", no day-of orientation, no FAQ link. |
| **Total** | | **25/40** | **Fair — below the "good" band; prioritizes logistics over anticipation.** |

## Anti-Patterns Verdict

**Does this look AI-generated? Partly — the structure does, the copy doesn't.**

**LLM assessment.** The section is competent template assembly, not bespoke romantic design. Three tells:
1. **Eyebrow scaffolding.** This one section carries *three* tiny uppercase tracked eyebrows — "Event Details", "Venue", and "Dress Code" (the last nested inside the venue card, a label-in-card-in-section). SKILL.md and the brand register both name repeated eyebrows as AI grammar. The h2 "The Day" already labels the section; the sub-eyebrows are noise.
2. **Placeholder dominance.** The venue card's right half is a sage→dusty-blue gradient with a CSS `::after { content:'Photo to come' }`. Real venue imagery already ships in the hero (`Assets/southdowns-manor.jpg`), and an `Assets/Dress Code.png` exists too — so this is unfinished, not restrained. DESIGN.md explicitly bans placeholder-dominant layouts once real imagery exists.
3. **Logistics-table shape.** A fixed-left time column + flex description is the archetypal wedding-template schedule. The copy ("we say our vows", "dancing into the night") is warm and specific, but the container says spreadsheet.

**Deterministic scan** (`detect.mjs`, 15 findings file-wide, exit 2). Mapped to this section:
- **In-section:** `em-dash-overuse` (file-wide "21 em-dashes"; this section contributes at least two — "soft, warm tones — details to follow", "Hampshire hills — full address…"), and undocumented color `rgba(255,255,255,0.85)` at line 202, which is the shared `.story-visual::after` "Photo to come" text — low-contrast white on the light gradient.
- **Rest-of-file (not this section):** layout-property transitions (lines 64, 72, 484), and undocumented colors/radii at lines 297/330/353/363/395/443/452/501 (mostly Travel/RSVP warmth tokens and pill radii).
- **Detector blind spots:** it did **not** flag the two biggest issues here — the `.reveal` blank-on-no-JS risk and the eyebrow overuse. Both are source/LLM catches; the clean-ish detector result should not be read as "this section is fine".

**Visual overlays.** No browser overlay was injected (the isolated assessment had no mutation path). Evidence is the deterministic CLI scan plus source review — no live overlay is available in the browser for this run.

## Overall Impression

The writing wants to be a garden letter; the layout is a checklist. The single biggest opportunity is the venue card: swap the "Photo to come" placeholder for the real manor image and this section stops apologizing for itself and starts building anticipation. Right after that, cut the label scaffolding and make the whole section fail-safe without JS.

## What's Working

1. **The copy has a pulse.** "We say our vows at Southdowns Manor. Please arrive with time to be seated" and "light suits and floral, flowing dresses in soft, warm tones" are personal and on-brand — the one place the section clearly belongs to Diego & Bethany.
2. **Type contrast carries the schedule.** Cormorant Garamond times in sage-deep against Jost descriptions give a clear, ceremonial read without extra ornament.
3. **Generous rhythm.** 28px row padding, 60px before the venue card, 44px card padding — the section breathes and never feels cramped.

## Priority Issues

- **[P0] `.reveal` ships the whole section blank without JS.** `.reveal { opacity:0; transform:translateY(28px) }` only becomes visible when JS adds `.in`, and it is *not* wrapped in `@media (prefers-reduced-motion: no-preference)` (unlike `#travel`/RSVP). Both the schedule and the venue card use `.reveal`.
  - *Why it matters:* No-JS, slow parse, headless render, or a script error leaves "The Day" empty — the core wedding info disappears. This matches a known repo P0.
  - *Fix:* Make content visible by default; gate the hidden-then-animate state behind a JS class on the section, wrap it in `@media (prefers-reduced-motion: no-preference)`, and add a `window.load` + timeout failsafe that reveals everything.
  - *Suggested command:* `/impeccable animate`

- **[P1] "Photo to come" placeholder kills anticipation.** The venue card's right column is a gradient + CSS `::after` text, while the real manor photo already ships in the hero.
  - *Why it matters:* Guests scroll to "The Day" to *see* where they're going; a placeholder reads as "not finalized" and dampens the emotional peak. It's also the low-contrast undocumented-color the detector flagged (line 202).
  - *Fix:* Use `Assets/southdowns-manor.jpg` (or a second real photo) in the venue card with a proper `<img>` + alt text; if no photo is ready, don't ship this half as a placeholder.
  - *Suggested command:* `/impeccable polish`

- **[P1] Three eyebrows in one section = label scaffolding.** "Event Details", "Venue", "Dress Code" repeat the same tiny-uppercase-tracked treatment; the last is nested inside the card.
  - *Why it matters:* Repeated eyebrows are a named AI tell and make an invitation feel like a form. The h2 already names the section.
  - *Fix:* Drop the "Event Details" eyebrow entirely; give "Venue" and "Dress Code" real heading semantics (`<h3>`/`<h4>`) with a quieter visual treatment instead of a third and fourth tracked label.
  - *Suggested command:* `/impeccable distill`

- **[P2] Schedule and venue card share no visual language.** The borderless time list and the shadowed cream-deep card sit as unrelated siblings, so "the day" doesn't read as one connected story.
  - *Why it matters:* Weak grouping raises cognitive load and blurs hierarchy between "when" and "where".
  - *Fix:* Unify them — a shared spine/timeline, consistent grid, or a single "order of the day" composition that flows into the venue.
  - *Suggested command:* `/impeccable layout`

- **[P2] Copy leans on em-dashes and hedges.** File-wide em-dash overuse (detector) plus "approximate for now", "to follow", "details to follow" three times.
  - *Why it matters:* The dash cadence is an AI tell and the hedging signals uncertainty at a high-stakes, once-a-year moment.
  - *Fix:* Replace some dashes with commas/periods; commit to firmer phrasing ("Ceremony at 1:30 PM" once times are set) and state clearly which events each guest tier is invited to.
  - *Suggested command:* `/impeccable clarify`

## Persona Red Flags

- **Margaret (older guest, 68, on a laptop):** The gradient + "Photo to come" makes her wonder if the venue is even confirmed; "~1:30 PM" reads as "not exactly 1:30" and she worries about arriving wrong; "full address… to follow" means she must remember to come back — with no calendar hook to save the date.
- **An evening-only guest scanning for their start time:** The ceremony/breakfast/reception split is buried in prose ("for our ceremony guests", "evening guests join us"). There's no at-a-glance signal of *which* events they're invited to or that ~7 PM is *their* arrival time — they have to read all three descriptions to work it out.
- **Screen-reader user:** "Photo to come" lives in a CSS `::after` and is never announced (the manor half is silent); the schedule is `div` soup rather than a `<dl>`/`<dt>`/`<dd>`, so there's no term/definition navigation; and "Venue"/"Dress Code" are `<span>` eyebrows, not headings, so the section has no sub-heading structure to jump between.

## Minor Observations

1. **Schedule on narrow phones:** the fixed `130px · 1fr` columns eat ~25% of a 375px screen; add a `max-width: ~480px` rule to stack time above name.
2. **Venue card shadow is nearly invisible** on cream-deep (12% warm shadow on #F3EBDC). Add a 1px `--line` border or lift the shadow so the card actually reads as lifted.
3. **Placeholder text is low-contrast** (white at 0.85 over a light sage/blue gradient) — moot once the real image lands, but currently hard to read.
4. **Dress Code has no heading** — only a `<span class="eyebrow">`, so it's structurally weaker than "Venue" which at least has an `<h3>`.

## Questions to Consider

1. Should "The Day" *show* the day — ceremony, breakfast, evening moments as real photos — instead of listing times in a grid?
2. Would guests be better served if the schedule made "which events am I invited to?" the primary read, rather than a uniform three-row list?
3. What would a confident, finished version look like — no "to follow", no placeholder, firm times — and is the section ready to publish before that exists?
