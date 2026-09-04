# Stack & Scale — UI Changes, System Tokens & Implementation Guide

> **Quick Reference**: This document aggregates all UI changes, design system tokens, typography rules, component patterns, and page blueprints implemented during the Vercel/Linear redesign. Keep this file updated whenever adding or modifying frontend features.

---

## 1. Quick Navigation to Documentation

All detailed specifications are organized under `docs/`:

| Document                   | Path                                                                                                     | Description                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Master UI/UX System**    | [`docs/design/UI-UX-SYSTEM.md`](docs/design/UI-UX-SYSTEM.md)                                             | Complete color tokens, typography scales, lighting effects, and grid rules                |
| **Component Catalog**      | [`docs/design/COMPONENT-CATALOG.md`](docs/design/COMPONENT-CATALOG.md)                                   | Specs, JSX patterns, and CSS classes for Header, Footer, Hero, Cards, Buttons, and Inputs |
| **Page Specifications**    | [`docs/design/PAGE-SPECS.md`](docs/design/PAGE-SPECS.md)                                                 | Route-by-route layout blueprints, hierarchy, and responsive behavior                      |
| **Architectural Decision** | [`docs/decisions/ADR-VERCEL-LINEAR-DARK-REDESIGN.md`](docs/decisions/ADR-VERCEL-LINEAR-DARK-REDESIGN.md) | Rationale, context, options evaluated, and architectural guarantees                       |

---

## 2. Summary of Changes Made

### 2.1 Aesthetic & Visual Transformation

- **From**: Editorial Sand & Serif (`#f5f2e8` canvas, Georgia serif typography, heavy shadows).
- **To**: Vercel & Linear-inspired Dark-First SaaS (`#000000` pitch black canvas, `#111111` card surfaces, Geist Sans & Geist Mono typography, 1px translucent border seams, ambient petrol radial lighting).

### 2.2 Core Files Modified / Created

| File                                                    | Status   | Description of Changes                                                                                                       |
| ------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/app/layout.tsx`                               | Modified | Added `GeistSans` and `GeistMono` from the `geist` package to root `<html>` classes.                                         |
| `apps/web/app/globals.css`                              | Modified | Full overhaul: new CSS variables, dark public page classes, Vercel-style 1px gap grids, preserved internal staff CSS styles. |
| `apps/web/public/brand/stack-and-scale-logo.svg`        | Modified | Updated horizontal vector lockup to use high-contrast white text (`#EDEDED`) and gray subtext (`#888888`) for dark headers.  |
| `apps/web/public/brand/stack-and-scale-logo-square.jpg` | Created  | Preserved uploaded high-resolution square brand logo.                                                                        |
| `apps/web/app/page.tsx`                                 | Modified | Homepage rewritten to use dark theme classes, radial petrol hero lighting, dot-grid matrix, and dark cards.                  |
| `apps/web/app/approach/page.tsx`                        | Modified | Approach page refactored with dark hero, 4-phase step grid with monospace step numbers, and conversion CTA.                  |
| `apps/web/app/solutions/page.tsx`                       | Modified | Solutions catalog refactored with 1px-seam stacked row cards and deep-link buttons.                                          |
| `apps/web/app/not-found.tsx`                            | Modified | Centered high-contrast dark 404 page with clamp numeric heading.                                                             |
| `apps/web/app/error.tsx`                                | Modified | Centered dark error boundary with reload trigger.                                                                            |
| `apps/web/app/loading.tsx`                              | Modified | Minimalist dark loading state with rotating quarter-arc spinner.                                                             |
| `apps/web/package.json`                                 | Modified | Added `geist` font package dependency.                                                                                       |

---

## 3. Design Tokens Cheat Sheet

When writing code or adding components, copy these CSS variables:

### Colors

```css
/* Backgrounds */
--night: #000000; /* Viewport canvas */
--gray-900: #111111; /* Card & surface */
--gray-800: #1a1a1a; /* Hover states */
--gray-700: #222222; /* Elevated dropdowns */

/* Borders */
--line: rgba(255, 255, 255, 0.08); /* Standard boundary */
--border-hover: rgba(255, 255, 255, 0.16); /* Interactive hover boundary */

/* Typography Colors */
--white: #ffffff; /* Primary headings */
--gray-100: #ededed; /* High-emphasis text */
--gray-200: #a1a1a1; /* Secondary text */
--gray-300: #888888; /* Body copy / descriptions */
--gray-400: #666666; /* Metadata / timestamps */

/* Brand Accents */
--petrol: #135d61; /* Radial glows & focus halos */
--seafoam: #80ddd1; /* Status dots, mono tags, active badges */
--solar: #f4c542; /* Warning / selective emphasis */
```

### Typography Rules

```css
font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
font-family: var(--font-geist-mono), ui-monospace, monospace;

/* Headings: Tight tracking */
letter-spacing: -0.02em; /* h3 */
letter-spacing: -0.03em; /* h2 */
letter-spacing: -0.04em; /* h1 */

/* Hero Gradient Fill */
background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## 4. UI Patterns for Implementing Future Pages

### Pattern A: Hero Section

```html
<section class="hero">
  <div class="hero-badge">
    <span class="pulse-dot"></span>
    <span>TAGLINE // 2026</span>
  </div>
  <h1 class="hero-title">Page Title Goes Here</h1>
  <p class="hero-description">Detailed descriptive subhead explaining value.</p>
  <div class="hero-actions">
    <button variant="primary">Primary Action</button>
    <button variant="outline">Secondary Action</button>
  </div>
</section>
```

### Pattern B: Vercel 1px Gap Grid

```html
<div class="grid-container">
  <div class="grid-card">
    <span class="mono-step">01</span>
    <h3>Feature Title</h3>
    <p>Feature explanation text.</p>
  </div>
  <div class="grid-card">
    <span class="mono-step">02</span>
    <h3>Feature Title</h3>
    <p>Feature explanation text.</p>
  </div>
</div>
```

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1px;
  background-color: var(--line);
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
}
.grid-card {
  background-color: var(--gray-900);
  padding: 2rem;
  transition: background-color 200ms ease;
}
.grid-card:hover {
  background-color: var(--gray-800);
}
```

---

## 5. Testing & Verification Commands

To verify that the frontend builds cleanly without TypeScript or lint errors:

```bash
# Build the web application bundle
pnpm --filter @stack-and-scale/web build

# Run linting
pnpm --filter @stack-and-scale/web lint

# Run dev server locally
pnpm --filter @stack-and-scale/web dev
```
