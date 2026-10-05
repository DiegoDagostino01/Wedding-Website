---
target: How it Began section
total_score: 25
p0_count: 1
p1_count: 2
timestamp: 2026-07-03T09-01-04Z
slug: diego-bethany-wedding-html-story
---
# Critique — "How it Began" / Our Story section

**Method:** A: isolated Explore sub-agent · B: detector + browser run in parent after A completed (Explore sub-agent had no terminal/browser tools). Partial degradation of B's isolation; A was fully isolated.

## Design Health Score — 25/40 (Acceptable)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Mostly n/a (static content); no fallback if reveal never fires |
| 2 | Match System / Real World | 3 | Warm, natural copy; "Photo to come" reads unfinished |
| 3 | User Control and Freedom | 3 | Passive content; no-JS path missing |
| 4 | Consistency and Standards | 3 | Story `.reveal` lacks the failsafe the travel section already has |
| 5 | Error Prevention | 1 | Reveal-gating with no failsafe → section ships blank (confirmed live) |
| 6 | Recognition Rather Than Recall | 3 | Scannable milestones, but they duplicate the prose |
| 7 | Flexibility and Efficiency | 2 | Content conditionally visible on JS + IO timing |
| 8 | Aesthetic and Minimalist Design | 2 | Empty placeholder claims 50% width; narrative told twice |
| 9 | Error Recovery | 2 | No recovery when the reveal doesn't fire |
| 10 | Help and Documentation | 3 | Clear labels; placeholder intent ambiguous |
| **Total** | | **25/40** | **Acceptable — significant improvements needed** |

## Anti-Patterns Verdict

**LLM assessment:** Borderline templated. The prose is genuinely personal (Iceland, Norwegian Fjords, "helped with coursework — and that was that") and rescues it from hard AI-slop judgment. But the sage→dusty-blue gradient "Photo to come" placeholder and the prose-then-milestones duplication make the section read as an unfinished template.

**Deterministic scan (`detect.mjs`, 15 findings total):** Only 2 touch this section:
- Line 202 `rgba(255,255,255,0.85)` — `.story-visual::after` placeholder text color, outside DESIGN.md palette. Reinforces the placeholder as undocumented drift.
- Em-dash overuse — 21 em-dashes site-wide (AI cadence tell); the story prose + milestones contribute several. Caught by detector, missed by the LLM review.
- The other 13 (layout-transition on nav, 999px radii, terracotta tonal drift, note colors) are elsewhere in the file — out of scope here.

**Visual evidence:** A live screenshot of `#story` rendered **blank except the botanical sprig** — no heading, no prose, no milestones, no placeholder box. The `.reveal` IntersectionObserver never added `.in`, so everything at `opacity:0` stayed invisible. This is the P0 reproduced, not theorized.

## Overall Impression

The writing is the best asset on the page and the presentation undercuts it. Biggest opportunity: make the content visible by default (kill the reveal-gating), then remove the empty placeholder and the prose/milestone duplication so the story leads.

## What's Working

1. **Authentic, specific prose.** Named places and a real origin detail; intimate without being saccharine. This is the section's identity.
2. **Botanical brand cohesion.** The sprig divider + cream-deep story-room background + terracotta date labels read as intentional and on-brand.

## Priority Issues

- **[P0] Story content ships blank when the reveal doesn't fire.** `.story-copy.reveal` / `.story-visual.reveal` start at `opacity:0` and only reveal when the IO adds `.in`. No failsafe — unlike the travel section, which already has `window.load + setTimeout` fallbacks. Confirmed live: the section rendered as just the sprig. Fix: make content visible by default, gate the hidden state behind a JS-added class (`#story.js-reveal .reveal`), wrap in `prefers-reduced-motion: no-preference`, and add a `load`/timeout `revealAll` failsafe mirroring the travel section. — `/impeccable harden`
- **[P1] Empty "Photo to come" placeholder dominates 50% of the composition.** Equal visual weight to the story, reads WIP, breaks the romantic beat. Fix: drop it until a real photo exists (let the prose breathe full-width), or make it a quiet asymmetric supporting element — not a 4/5 gradient box with overlay text. — `/impeccable layout`
- **[P1] The story is told twice.** Prose and milestones restate the same three facts (met at uni, proposed 22 May 2025, wed 29 Apr 2027). Taxes working memory and dilutes the proposal peak. Fix: pick one mode — either drop the milestones, or trim the prose to feeling/context and let the milestones carry dates. — `/impeccable distill`
- **[P2] Milestone `.desc` at `opacity:0.85` risks failing AA.** Ink at 85% on cream-deep is marginal; opacity is the wrong tool for de-emphasis. Fix: full-opacity ink and de-emphasize with size/weight instead. — `/impeccable colorize`
- **[P2] Em-dash cadence.** Story copy leans on em-dashes ("— and that was that", "— Bethany lent a hand"); part of the site-wide count of 21. Fix: vary punctuation in the couple's story lines. — `/impeccable clarify`
- **[P3] Redundant eyebrow + title.** "Our Story" over "How it began" label the same thing. Fix: keep the title alone, or make the eyebrow a distinct thematic layer.

## Persona Red Flags

- **Sam (screen-reader / keyboard):** If the reveal doesn't fire, the story and milestones are visually gone; combined with `opacity:0`, the section is effectively empty to a sighted keyboard user. No `<noscript>` / visible-by-default fallback.
- **Jordan (first-time guest, slow mobile):** Scrolls to the story before JS/IO initialises, sees a blank band under the sprig, assumes the site is broken — exactly what the live screenshot shows.
- **Riley (link-preview / headless crawler):** Social preview and headless screenshots capture the blank section; the couple's story never appears in shares.

## Minor Observations

- Milestone date formats are mixed ("Covid, Year One" vs "22 May 2025"); intentional but slightly uneven.
- Mobile `order:-1` puts the empty placeholder above the prose — image-first on mobile is backwards for a narrative.
- Cream-deep background is shared by story, details, and travel — little section-to-section variety.
