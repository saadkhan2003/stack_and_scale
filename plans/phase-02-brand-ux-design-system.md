# Phase 02 — Brand, UX and Design System

## Outcome

Turn the existing logo and color palette into an accessible, responsive company design system and validated experience architecture for the public V1.

## Execution profile

- **Model tier:** strongest for information/interaction design; default for component implementation
- **Mode:** parallel with Phase 03 and early Phase 10
- **External-platform spend:** $0
- **Depends on:** Phase 01
- **Unlocks:** Phases 06 and 07

## Source decisions

Questions 4–6, 9, 19–23, 61–69, 75 and 79.

## Work packages

### 02.1 Brand asset audit

- Validate logo formats, clear space, minimum size and light/dark variants.
- Test approved colors for WCAG contrast.
- Identify missing typography, iconography, illustration and product-media rules.

### 02.2 Typography selection

- Compare locally hostable, commercially usable typefaces.
- Select display, body and mono roles with fallback stacks.
- Define readable scales across mobile and desktop.
- Prevent font loading from becoming a performance or privacy dependency.

### 02.3 Token system

- Color, typography, spacing, radius, shadow, border, motion, breakpoint and z-index tokens.
- Semantic tokens for surfaces, text, status and interaction states.
- Light and dark section behavior without requiring a full theme switch.

### 02.4 UX architecture

- Validate public navigation, route taxonomy and mobile navigation.
- Produce wireframes for home, product, service, work, resource, contact and form journeys.
- Define contextual CTA hierarchy.
- Design empty, loading, error, validation and success states.

### 02.5 Component foundation

- Normalize selected open-source primitives into `packages/ui`.
- Implement typography, buttons, links, form controls, navigation, cards, media frames, dialogs, toasts and layout primitives.
- Add keyboard, focus, screen-reader and reduced-motion behavior.

### 02.6 Motion and 3D policy

- Define allowed motion patterns and timing tokens.
- Create a performance and accessibility gate for every advanced effect.
- Prototype the ecosystem hero without committing it to production.
- Define static and low-power fallbacks.

### 02.7 Visual test surface

- Create a local component catalog.
- Cover responsive states and CMS content extremes.
- Add screenshot/visual regression for critical primitives when stable.

## Deliverables

```text
docs/design/BRAND-SYSTEM.md
docs/design/UX-ARCHITECTURE.md
docs/design/MOTION-POLICY.md
docs/design/CONTENT-WIREFRAMES.md
packages/ui/*
```

## Exit criteria

- Typography and tokens are approved.
- Critical components pass keyboard and contrast checks.
- Homepage and core detail-page wireframes are validated.
- Motion fallback rules exist.
- No component registry is consumed directly outside the design-system package.

## Rollback and recovery

Tokens and primitives must be introduced in small commits. Revert individual primitives or visual experiments without reverting the approved UX architecture.

## Cold-start handoff

Read Questions 4–6, 19–23 and 61–69 plus the Brand and Experience section of the blueprint. Preserve the hybrid trusted/premium direction.
