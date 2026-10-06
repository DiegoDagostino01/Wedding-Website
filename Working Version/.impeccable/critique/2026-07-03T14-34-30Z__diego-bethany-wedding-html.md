---
target: diego-bethany-wedding.html
total_score: 32
p0_count: 0
p1_count: 2
timestamp: 2026-07-03T14-34-30Z
slug: diego-bethany-wedding-html
---
Method: dual-agent (A: design-review sub-agent · B: detector+evidence sub-agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Countdown, nav scroll-state, "Copied" feedback, sending spinner, `aria-live` note, success panel — verified loading→success live. |
| 2 | Match System / Real World | 4 | "Wedding Breakfast", "Joyfully accepts/Regretfully declines", garden-formal cues — guests' language throughout. |
| 3 | User Control and Freedom | 3 | No way to edit an RSVP after the success screen; no undo. |
| 4 | Consistency and Standards | 3 | User-facing UI is consistent, but detector found real token drift: 18 off-scale radii vs the documented 3/4/6px, an undocumented `#C25B6E` rose accent (5×), a warm-brown leftover, and semantically-inverted token names. |
| 5 | Error Prevention | 3 | Good input types + guest cap, but no name length cap and no email-ownership confirmation. |
| 6 | Recognition Rather Than Recall | 3 | No active-section nav highlight on an ~11,000px page; RSVP deadline not echoed near the submit button. |
| 7 | Flexibility and Efficiency | 3 | Postcode copy + Maps links are thoughtful; no skip-link, no keyboard accelerators. |
| 8 | Aesthetic and Minimalist Design | 4 | Restrained, elegant, spring-fresh; strong whitespace rhythm. |
| 9 | Error Recovery | 3 | Inline field errors + focus management + mailto network-fail fallback; no post-submit recovery path. |
| 10 | Help and Documentation | 2 | Excellent proactive rural-travel notes, but many blocks are "confirming soon" with no interim answer. |
| **Total** | | **32/40** | **Good — solid foundation, address weak areas** |

## Anti-Patterns Verdict

**Does this look AI-generated? No — decisively.** Both assessments independently placed it in the top decile of bespoke, art-directed work.

**LLM assessment:** All absolute bans clear. No side-stripe borders (the left "vine" is a hand-built botanical `<symbol>`/`<use>` system), no gradient text (headings are solid `--ink`), glassmorphism used once intentionally on the nav, no hero-metric template (the "metrics" are a wedding countdown — contextually perfect), no identical card grids (story is asymmetric, schedule is a timeline, stays auto-fill, gallery 3-col — real variety), no numbered markers, no text overflow. Personality is strong: Dancing Script reserved to the couple's names, watercolour art, and copy with a real voice ("no hunting across ten browser tabs required", "the one that catches people out"). The one systematized pattern is the pill `.eyebrow` kicker above nearly every section — both assessments judged it a *deliberate brand system* (it shares the botanical dot-node/sprig motif language) but *borderline*.

**Deterministic scan:** `detect.mjs` exit 2, **44 findings (6 warning, 38 advisory)** — `design-system-color` 20, `design-system-radius` 18, `layout-transition` 3, `overused-font` 1 (Montserrat), `bounce-easing` 1, `em-dash-overuse` 1. Assessment B classified **none as functional defects**: the `rgba(255,255,255,x)` and `#000` color hits are intentional translucency/shadows (false positives); the `999px` radii are brand pills; em-dashes and Montserrat are voice/legibility choices. Two color findings are genuine design-system decisions worth making: the undocumented `#C25B6E` rose accent (appears 5×) and a warm-brown `rgba(58,48,22,0.55)` that looks like a leftover from the pre-spring warm theme. The detector did NOT flag the decorative motion systems — reduced-motion gating is clean.

**Live evidence:** 20/20 images load, 16/16 OSM map tiles load, 0 console/page errors, no horizontal overflow at 390px (scrollWidth 375 < innerWidth 390), RSVP submit → loading → success panel works in preview mode. No visual defects at desktop or mobile.

## Overall Impression

A confident, emotionally intelligent wedding invitation with genuine UX empathy for the rural-wedding-guest problem. Its weaknesses are **content-readiness**, not craft: a cluster of "confirming soon" placeholders in the highest-anxiety section, a preview-mode RSVP that fakes success while storing nothing, and a handful of small-but-consequential mobile tap targets. The single biggest opportunity: close the gap between what the *design* promises ("everything is handled") and what the *content* currently delivers ("confirming soon" ×6).

## What's Working

1. **A coherent, hand-built motif system is the anti-slop backbone.** One botanical vocabulary (the `.sprig` divider, the dot-node reused on the schedule spine + venue pin + dress cues, the scroll-driven flowering vine, drifting petals) ties every section together — design-system thinking in a single file. It's *why* the eyebrow pills read as brand rather than scaffold.
2. **Domain-expert RSVP + travel UX.** Decline collapses the party block with `inert` + `aria-hidden` + disabled inputs; guests cap at 4 with an explanatory note; empty submit sets `aria-invalid`, reveals errors, announces via `role="status"`, and focuses the first invalid field. Travel anticipates the specific failure modes of a rural venue (last trains, "signal is patchy — screenshot your directions", "book your taxi back in advance").
3. **Disciplined, accessible progressive enhancement.** Content is visible by default; motion, the invitation veil, reveals, vine, and petals are all gated behind JS + IntersectionObserver + prefers-reduced-motion, with failsafes so nothing is ever left hidden. Personalization uses `textContent` (XSS-safe — verified with `<script>`/emoji input). Core text contrast is strong (body/nav ~8:1).

## Priority Issues

**[P1] "Confirming soon" placeholders cluster in the highest-anxiety section with no interim fallback.**
- *Why it matters:* Travel is where a rural-venue guest most needs certainty. A stack of "we'll add this later" (parking, what3words, group rates, taxis, shuttle) erodes trust exactly where reassurance should peak, and gives an early-booking guest no actionable answer.
- *Fix:* Give each pending note a usable interim — a real local-taxi number or two now, a "park on-site, follow signs" line, and the existing `Diego.beth21@gmail.com` as the catch-all "ask us" path. Convert "we'll add it" into "here's what we know today."
- *Suggested command:* `/impeccable clarify`

**[P1] Preview-mode RSVP shows a false "your reply is in" — nothing is stored (launch gate).**
- *Why it matters:* `RSVP_ENDPOINT` is empty, so the form logs to console, fakes a 700ms delay, and shows the full success panel. Any guest who submits today is told "your reply is in" while no reply is captured — a silent data-loss + trust failure the moment the link is shared.
- *Fix:* Wire the Google Apps Script endpoint before sharing, OR gate the success copy so it can't claim success until a real endpoint resolves (show a "preview" state otherwise).
- *Suggested command:* `/impeccable harden`

**[P2] Sub-44px mobile tap targets on the secondary controls guests rely on most.**
- *Why it matters (measured at 390px):* postcode copy 32px, "Add another guest" 38px, external travel links (~27px), mobile drawer links (~19px hit area). Mixed-age, one-handed phone guests — and older relatives — will mis-tap the exact travel controls they need. Primary Submit (62px) and attend options (57px) are fine.
- *Fix:* Raise secondary controls to ≥44px min-height (pad the copy button, add-guest, and `.ext-link`; give drawer `<a>` items vertical padding).
- *Suggested command:* `/impeccable adapt`

**[P2] Design-system token drift — cosmetic now, a maintenance trap later.**
- *Why it matters:* 18 radii off the documented 3/4/6px scale (2/9/10/11/12/14/16/18/20px), an undocumented `#C25B6E` rose accent used 5×, a warm-brown `rgba(58,48,22,0.55)` that reads as a pre-spring-theme leftover, and token names whose meaning is inverted (`--peach`/`--terracotta`/`--gold` now all hold blues). None hurt users today; all make the next edit riskier and invite subtle inconsistency.
- *Fix:* Tokenize the rose error accent, confirm/retire the warm-brown, consolidate the radius scale, and either rename or clearly document the inverted tokens.
- *Suggested command:* `/impeccable extract`

**[P3] RSVP edge cases: self-contradicting guest row, no post-submit edit, refresh wipes the form.**
- *Why it matters:* The party block loads with one empty "Guest's full name" row while the hint says "Coming solo? Leave this empty" — guests may re-type their own name (double-counting `party_size = 1 + guests`). After success the form is `hidden` with no "edit my reply", and an accidental reload loses a half-completed RSVP (no draft persistence); name has no length cap.
- *Fix:* Start guests at zero rows with "Add another guest" as the sole affordance (or relabel "Add anyone else in your party (optional)"); add "Need to change something? Email us" under the success message; persist a draft to `localStorage`; cap name length.
- *Suggested command:* `/impeccable harden`

## Persona Red Flags

**Jordan (confused first-timer):** Mostly smooth. Red flags: the pre-filled empty guest row under "Who's coming with you?" contradicts "Coming solo? Leave this empty" → may re-type own name and double-count. The date lives only in prose + countdown — no "Save the date / add to calendar" affordance.

**Riley (stress tester):** Build largely wins (verified live): 300-char name + long guest names clip inside inputs with no layout break or page overflow; empty submit flags both fields, shows errors, focuses name; emoji/accented/`<script>` input submits safely (`textContent`, inert script). Red flags: refresh mid-flow wipes everything (no draft persistence); multiple tabs don't sync and there's no duplicate-submit guard (in live mode → duplicate rows); name is trimmed but not length-capped (a 5,000-char name would post).

**Casey (distracted one-handed mobile):** Primary path fine — big Submit (62px), single-column fields, vertical accept/decline stack. Red flags: the 12-hotel "Where to stay" list is a long one-thumb scroll with small inline links; copy-postcode (32px) and add-guest (38px) are easy to miss one-handed.

**Older, less-technical invited relative on a phone (project persona):** Friction concentrates here. Small secondary tap targets (postcode copy 32px, travel links ~27px, drawer links ~19px) are hardest for reduced-dexterity users — and they sit on the travel controls this persona most needs. The bare ☰ hamburger has no "Menu" label. The "confirming soon" gaps hurt this persona most (least able to improvise taxis/parking). Positive: large readable body copy (~8:1 contrast), generous line-height, and the reassuring rural-driving notes are exactly right for them.

## Minor Observations

- **Cognitive load is low overall (1 clear failure).** The one heavy moment is Travel: 12 accommodations across 4 tiers is a >4-option decision point (mitigated by tiering + a "Closest to the venue" flag), inside an already-long single scroll.
- **The eyebrow pill** above nearly every section is the one pattern that could invite a templated read; both assessments judged it deliberate-but-borderline. Consider dropping it on 1–2 sections (Gallery, Venue-in-card) and letting the `.sprig` divider carry more of the sectioning.
- **Gallery is an empty promise before the conversion** — 6 tasteful "Photos to come" placeholder tiles sit right before the RSVP ask; their italic labels are the lowest-contrast text on the page.
- **`bounce-easing`** `cubic-bezier(0.34,1.56,0.64,1)` is a real overshoot curve — deliberate here, but the only easing that isn't a pure ease-out.
- **Countdown** repaints every second even when off-screen — negligible, just noted.

## Questions to Consider

1. The gallery is an empty promise placed right before your only conversion — is a 6-tile "Photos to come" grid building anticipation, or a hole in the story that lowers momentum just before the RSVP ask? Would cutting it until you have one real image serve the guest better?
2. The emotional design says "everything is handled"; the content says "confirming soon" six times. Which promise does a nervous guest booking a hotel in 2026 actually believe?
3. If most of these guests open this on a phone (mixed ages, one-handed), why did the desktop experience (vine, parallax, petals, two-column stories) get the most craft while the phone gets a static rail and the smallest tap targets?
