# Graph Report - Deployable  (2026-08-28)

## Corpus Check
- 39 files · ~28,255 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 153 nodes · 155 edges · 55 communities (11 shown, 44 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.83)
- Token cost: 12,000 input · 4,000 output

## Community Hubs (Navigation)
- Scroll Reveal & Motion
- Travel Icons & Assets
- Journey Map Engine
- Hero & Primary Sections
- RSVP Guest Logic
- Color Palette Tokens
- Typography System
- Custom Select
- Petal Animation
- Mobile Navigation
- Gallery Lightbox
- Reykjavik Imagery
- Palette Rationale
- Guest List Loading
- Countdown Helpers
- Form Validation
- Flower Inspiration
- Brand Logo
- Save The Date
- Shadow Photo
- Southampton Image
- Southdowns Manor Venue
- Swansea Image
- Southampton Harbour
- Vinyard Image
- Waterfall Image
- Blush Accent
- Botanical Divider
- Button Primary
- Card Soft Component
- Component Library
- Deep Blush
- Deep Leaf Green
- Elevation & Shadow
- Error Rose
- Forest Green
- Garden Ink Text
- Input Dark
- Manor Garden Concept
- Map Dark Stage
- Navigation Bar
- Olive Stem
- Pastel Mist Panel
- Sky Emphasis
- Soft Paper Surface
- Impeccable Skill
- Taste Skill
- Couple Identity
- Dress Code
- FAQ Section
- Photo Gallery
- Invitation Veil
- Brand Personality
- Design Principles
- Guest Audience

## God Nodes (most connected - your core abstractions)
1. `initInteractiveJourneyMap()` - 8 edges
2. `clamp()` - 7 edges
3. `Travel & Venue Info` - 7 edges
4. `normaliseName()` - 5 edges
5. `initCustomSelects()` - 5 edges
6. `tick()` - 5 edges
7. `renderJourneyProgress()` - 5 edges
8. `Design System` - 5 edges
9. `Wedding Website Product Purpose` - 5 edges
10. `Scroll Journey Map` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Countdown Timer` --conceptually_related_to--> `updateCountdown()`  [INFERRED]
  Index.html → scripts.js
- `Hero Section` --references--> `Hero Background`  [INFERRED]
  Index.html → Assets/Hero-Background.png
- `Hero Section` --references--> `Proposal`  [INFERRED]
  Index.html → Assets/Proposal.png
- `Travel & Venue Info` --references--> `Airplane Icon`  [EXTRACTED]
  Index.html → Assets/Airplane icon.png
- `Travel & Venue Info` --references--> `Car Icon`  [EXTRACTED]
  Index.html → Assets/Car Icon.png

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Wedding Day Guest Flow** — index_hero_section, index_schedule_section, index_travel_section, index_rsvp_section [INFERRED 0.85]
- **Design System Token Coherence** — design_invitation_sky, design_spring_sage, design_sky_accent, design_blush [EXTRACTED 0.75]

## Communities (55 total, 44 thin omitted)

### Community 0 - "Scroll Reveal & Motion"
Cohesion: 0.07
Nodes (14): Gallery Lightbox, Petal Field Canvas, Vine Scroll Animation, copyBtn, countdownEl, dressSection, faqSection, honeymoonSection (+6 more)

### Community 1 - "Travel Icons & Assets"
Cohesion: 0.17
Nodes (13): Airplane Icon, Car Icon, Cruise Icon, Dress Code, Geiranger, Swansea to Geirangerfjord Reference Video, Geirangerfjord, Swansea Bay (+5 more)

### Community 2 - "Journey Map Engine"
Cohesion: 0.27
Nodes (13): boot(), initInteractiveJourneyMap(), clamp(), renderJourneyProgress(), requestJourneyRender(), sectionProgress(), setStage(), smoothstep() (+5 more)

### Community 3 - "Hero & Primary Sections"
Cohesion: 0.18
Nodes (11): Hero Background, Proposal, Countdown Timer, Hero Section, RSVP Form, Wedding Day Schedule, Story Section, 29 April 2027 (+3 more)

### Community 4 - "RSVP Guest Logic"
Cohesion: 0.25
Nodes (9): collect(), findGuest(), isDeclining(), normaliseName(), pickGuest(), renderPickerResults(), showSuccess(), syncAttendance() (+1 more)

### Community 5 - "Color Palette Tokens"
Cohesion: 0.67
Nodes (5): Design System, Invitation Sky, Pressed Paper, Sky Accent, Spring Sage

### Community 6 - "Typography System"
Cohesion: 0.40
Nodes (5): Great Vibes, Montserrat, Noto Serif Display, One Script Moment keeps Great Vibes special, Typography System

### Community 7 - "Custom Select"
Cohesion: 0.50
Nodes (3): close(), initCustomSelects(), choose()

### Community 8 - "Petal Animation"
Cohesion: 0.40
Nodes (5): frame(), makePetal(), rnd(), seed(), start()

### Community 9 - "Mobile Navigation"
Cohesion: 0.50
Nodes (4): closeNav(), createBackdrop(), openNav(), removeBackdrop()

### Community 10 - "Gallery Lightbox"
Cohesion: 0.67
Nodes (3): navigate(), open(), showItem()

## Knowledge Gaps
- **69 isolated node(s):** `nav`, `navToggle`, `navLinks`, `weddingDate`, `countdownEl` (+64 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Scroll Journey Map` connect `Travel Icons & Assets` to `Scroll Reveal & Motion`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `Travel & Venue Info` connect `Travel Icons & Assets` to `Hero & Primary Sections`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Travel & Venue Info` (e.g. with `Honeymoon Journey` and `Wedding Website Product Purpose`) actually correct?**
  _`Travel & Venue Info` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `nav`, `navToggle`, `navLinks` to the rest of the system?**
  _69 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Scroll Reveal & Motion` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._