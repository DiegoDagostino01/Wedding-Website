# Extracted Skill Definitions

This folder contains the extracted skill packages from the zip archives. The following skills are available as individual definitions in the workspace.

## Impeccable Skill
- Path: `impeccable-main\\impeccable-main\\plugin\\skills\\impeccable\\SKILL.md`
- Name: `impeccable`
- Description: Use when the user wants to design, redesign, shape, critique, audit, polish, clarify, distill, harden, optimize, adapt, animate, colorize, extract, or otherwise improve a frontend interface. Covers websites, landing pages, dashboards, product UI, app shells, components, forms, settings, onboarding, and empty states. Handles UX review, visual hierarchy, information architecture, cognitive load, accessibility, performance, responsive behavior, theming, anti-patterns, typography, fonts, spacing, layout, alignment, color, motion, micro-interactions, UX copy, error states, edge cases, i18n, and reusable design systems or tokens. Also use for bland designs that need to become bolder or more delightful, loud designs that should become quieter, live browser iteration on UI elements, or ambitious visual effects that should feel technically extraordinary. Not for backend-only or non-UI tasks.
- Version: `3.9.1`
- Invocation hint: `[craft|shape · audit|critique · animate|bolder|colorize|delight|layout|overdrive|quieter|typeset · adapt|clarify|distill · harden|onboard|optimize|polish · init|document|extract|live] [target]`

## Taste Skill Package
The `taste-skill-main` extraction contains multiple frontend design skills.

### Primary taste skill definitions
- `taste-skill-main\\taste-skill-main\\skills\\taste-skill\\SKILL.md`
  - Name: `design-taste-frontend`
  - Description: Anti-slop frontend skill for landing pages, portfolios, and redesigns. The agent reads the brief, infers the right design direction, and ships interfaces that do not look templated. Real design systems when applicable, audit-first on redesigns, strict pre-flight check.

- `taste-skill-main\\taste-skill-main\\skills\\taste-skill-v1\\SKILL.md`
  - Name: `design-taste-frontend-v1`
  - Description: The original v1 taste-skill, preserved for projects depending on its exact behavior. The current default is `design-taste-frontend` (v2 experimental), which is a substantial rewrite. Use this v1 install name only if you need exact backward compatibility.

- `taste-skill-main\\taste-skill-main\\skills\\output-skill\\SKILL.md`
  - Name: `output-skill`
  - Description: Use the output-skill metadata file to capture its exact behavior.

- `taste-skill-main\\taste-skill-main\\skills\\redesign-skill\\SKILL.md`
  - Name: `redesign-skill`
  - Description: Use the redesign-skill metadata file to capture its exact behavior.

- `taste-skill-main\\taste-skill-main\\skills\\minimalist-skill\\SKILL.md`
  - Name: `minimalist-skill`
  - Description: Use the minimalist-skill metadata file to capture its exact behavior.

## Additional available taste skill folders
The `taste-skill-main\\taste-skill-main\\skills` directory also contains the following skill folders and definitions:

- `brandkit`
- `brutalist-skill`
- `gpt-tasteskill`
- `image-to-code-skill`
- `imagegen-frontend-mobile`
- `imagegen-frontend-web`
- `llms.txt`
- `minimalist-skill`
- `output-skill`
- `redesign-skill`
- `soft-skill`
- `stitch-skill`
- `taste-skill`
- `taste-skill-v1`

## How to use these extracted skills
1. Open the relevant `SKILL.md` file in the workspace.
2. Use its `name` and `description` to wire it into your local agent or documentation.
3. For the `impeccable` skill, the file also contains commands and setup instructions.
4. For the taste skill (`design-taste-frontend`), the file contains a full anti-slop frontend design guide.

## Notes
- The `impeccable-main` package contains the `impeccable` skill in the `plugin` directory, which is the primary usable definition for this archive.
- The `taste-skill-main` package contains multiple frontend skill definitions; the main skill definitions are under `skills/*/SKILL.md`.
- If you want, I can also extract a cleaned command list or convert these skill definitions into a single consolidated reference file.
