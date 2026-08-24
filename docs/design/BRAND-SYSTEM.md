# Stack & Scale Brand System

## Intent

Stack & Scale should feel like a trusted software company with world-class engineering capability: composed, useful, technically credible and never generic.

## Approved assets

- Master logo: `apps/web/public/brand/stack-and-scale-logo.jpeg`
- Maintain clear space around the mark equal to the visible ampersand height.
- Use the full logo at 144 px or wider in navigation. Use a future icon-only asset below that size; do not crop the current raster logo into an icon.
- The current 1254×1254 JPEG is adequate for web navigation and social previews, but a vector/SVG master and transparent icon-only export remain requested brand deliverables.

## Color roles

| Role | Token | Value | Use |
|---|---|---|---|
| Foundation | Night | `#0B1616` | dark sections, primary actions |
| Primary | Petrol | `#135D61` | links, operational emphasis |
| Signal | Solar | `#F4C542` | focus rings and selective emphasis |
| Lift | Seafoam | `#80DDD1` | highlights and positive states |
| Canvas | Sand | `#F5F2E8` | primary page background |

All body copy uses ink or sand on its inverse surface. Solar is not used as small text on Sand.

## Typography

- Display: Georgia fallback today; replace with a locally hosted, commercially usable display face only after visual review.
- Body/UI: system sans stack to avoid a third-party font/privacy dependency.
- Mono/data: system monospace stack only for product metrics and operational detail.
- Body size: at least 16 px; controls at least 44 px tall. Display headings use `clamp()` so they remain readable from compact mobile through wide desktop.

## Token baseline

`packages/ui` is the source for approved color, spacing, radius, border, shadow, motion, breakpoint and layering tokens. Public web imports its CSS tokens instead of a component-registry stylesheet. The initial semantic surface set is Canvas, Inverse and Accent; the initial text set is Primary, Inverse and Muted.

Current interactive rules: focus uses Solar, primary actions use Night with Sand text, secondary actions use a subtle Night border, and no small Solar text is permitted on Sand.

## Visual language

Use editorial typography, dark operational interface cards, thin structural lines and one selected bright signal. Product visuals must communicate a real workflow; never use generic stock “AI” imagery as primary proof.
