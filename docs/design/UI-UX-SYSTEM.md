# Stack & Scale — UI/UX Design System Specification (v2.0)

> **Design Vision**: High-precision, dark-first modern SaaS aesthetic directly inspired by [vercel.com](https://vercel.com) and [linear.app](https://linear.app). Engineered for developers, enterprise architects, and technical leaders.

---

## Table of Contents

1. [Executive Summary & Core Philosophy](#1-executive-summary--core-philosophy)
2. [Color Token System](#2-color-token-system)
3. [Typography System & Font Hierarchy](#3-typography-system--font-hierarchy)
4. [Grid Systems & Spatial Metrics](#4-grid-systems--spatial-metrics)
5. [Elevation, Borders & Atmospheric Lighting](#5-elevation-borders--atmospheric-lighting)
6. [Core Component Specifications](#6-core-component-specifications)
7. [Page-by-Page Architectural Blueprints](#7-page-by-page-architectural-blueprints)
8. [Responsive Breakpoints & Layout Adaptations](#8-responsive-breakpoints--layout-adaptations)
9. [Staff & Internal Portal Isolation Policy](#9-staff--internal-portal-isolation-policy)
10. [Developer Implementation Guidelines](#10-developer-implementation-guidelines)

---

## 1. Executive Summary & Core Philosophy

### The Evolution

Stack & Scale originally used an editorial sand-and-serif theme (`#f5f2e8` canvas with Georgia serif headings). While classic, modern technical buyers expect the razor-sharp clarity and speed associated with top-tier infrastructure platforms like Vercel and Linear.

### The New Aesthetic Principles

1. **Dark Canvas First**: Pitch black (`#000000`) and rich carbon (`#0a0a0a` / `#111111`) establish maximum contrast and depth.
2. **Subtle 1-Pixel Boundaries**: Heavy shadows are eliminated in favor of delicate `1px` translucent borders (`rgba(255, 255, 255, 0.08)`).
3. **Atmospheric Lighting**: Soft, restrained radial gradients (using brand `--petrol` `#135d61`) provide ambient illumination without visual noise.
4. **Geist Typography**: Clean, geometric sans-serif for UI clarity, paired with monospaced accents for technical telemetry, timestamps, badges, and metrics.
5. **Vercel-Style 1px Gap Grids**: Cards nested in parent containers with 1px gaps that expose background border lines cleanly.

---

## 2. Color Token System

All color tokens are exposed via CSS variables in `apps/web/app/globals.css`.

### 2.1 Grayscale Ladder (The Foundation)

| Token                    | Hex / Value           | Semantic Role                             |
| ------------------------ | --------------------- | ----------------------------------------- |
| `--night` / `--canvas`   | `#000000`             | Primary viewport background               |
| `--gray-1000`            | `#000000`             | Deepest black                             |
| `--gray-900`             | `#0a0a0a` / `#111111` | Primary card & surface background         |
| `--gray-800`             | `#161616` / `#1a1a1a` | Card hover states, secondary surfaces     |
| `--gray-700`             | `#222222`             | Tertiary surfaces, dropdown menus         |
| `--gray-600`             | `#333333`             | Strong dividers, subtle outlines          |
| `--gray-500`             | `#444444`             | Inactive icons, subtle border states      |
| `--gray-400`             | `#666666`             | Tertiary body copy, metadata timestamps   |
| `--gray-300` / `--muted` | `#888888`             | Secondary body text, card descriptions    |
| `--gray-200`             | `#a1a1a1`             | Secondary headings, interactive labels    |
| `--gray-100` / `--ink`   | `#ededed`             | Primary body text, clear reading content  |
| `--gray-50`              | `#fafafa`             | Bright contrast text, high-emphasis icons |
| `--white`                | `#ffffff`             | Primary headings, bright CTA text         |

### 2.2 Brand Accent Tokens

| Token       | Hex / Value | Semantic Role                | Usage Rule                                            |
| ----------- | ----------- | ---------------------------- | ----------------------------------------------------- |
| `--petrol`  | `#135d61`   | Primary Brand Glow & Tint    | Radial hero gradients, focus halos, subtle glow rings |
| `--seafoam` | `#80ddd1`   | High-Signal Accent & Success | Status indicator dots, active pills, monospace tags   |
| `--solar`   | `#f4c542`   | Warning & Selective Energy   | Caution badges, spotlight highlights (used sparingly) |
| `--crimson` | `#ef4444`   | Destructive & Alert States   | Error messages, form validation failures              |

### 2.3 Interactive & Border Tokens

| Token             | CSS Definition                                                                      | Usage Context                                  |
| ----------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------- |
| `--line`          | `rgba(255, 255, 255, 0.08)`                                                         | Default structural border on cards and headers |
| `--border-hover`  | `rgba(255, 255, 255, 0.16)`                                                         | Card and button hover boundary                 |
| `--border-active` | `rgba(255, 255, 255, 0.30)`                                                         | Active button focus or selected item border    |
| `--surface-glass` | `rgba(10, 10, 10, 0.8)`                                                             | Sticky header / modal backdrop with blur       |
| `--glow-primary`  | `radial-gradient(ellipse 80% 60% at 50% -20%, rgba(19, 93, 97, 0.25), transparent)` | Ambient hero light                             |

---

## 3. Typography System & Font Hierarchy

### 3.1 Font Families

Loaded via Next.js and the official `geist` package:

- **`var(--font-geist-sans)`**: Clean sans-serif used for all headlines, subheads, UI controls, navigation, and paragraphs.
- **`var(--font-geist-mono)`**: Monospaced font used for numbers, metrics, code snippets, status tags, and metadata pills.

### 3.2 Typography Scale & Rules

| Element            | Class / Tag         | Size                             | Weight    | Tracking  | Line Height | Color                                          |
| ------------------ | ------------------- | -------------------------------- | --------- | --------- | ----------- | ---------------------------------------------- |
| **Display Hero**   | `h1.hero-title`     | `clamp(2.5rem, 5.5vw, 4.75rem)`  | 700 / 800 | `-0.04em` | `1.05`      | Gradient: `#ffffff` to `rgba(255,255,255,0.7)` |
| **Section Title**  | `h2.section-title`  | `clamp(1.75rem, 3.5vw, 2.75rem)` | 700       | `-0.03em` | `1.15`      | `#ffffff`                                      |
| **Card Heading**   | `h3.card-title`     | `1.25rem` to `1.375rem`          | 600       | `-0.02em` | `1.3`       | `#ffffff`                                      |
| **Eyebrow Label**  | `.eyebrow`          | `0.75rem` to `0.8125rem`         | 600       | `+0.12em` | `1.0`       | `var(--seafoam)` (Uppercase)                   |
| **Lead Paragraph** | `.hero-description` | `1.125rem` to `1.25rem`          | 400       | `-0.01em` | `1.6`       | `var(--gray-300)`                              |
| **Standard Body**  | `p`, `.body-text`   | `0.9375rem`                      | 400       | `0`       | `1.65`      | `var(--gray-300)`                              |
| **Mono Badge**     | `.badge-mono`       | `0.75rem` to `0.8125rem`         | 500       | `+0.05em` | `1.0`       | `var(--gray-200)` / `var(--seafoam)`           |
| **Small Caption**  | `small`, `.caption` | `0.8125rem`                      | 400       | `0`       | `1.5`       | `var(--gray-400)`                              |

### 3.3 Text Rendering Standards

- Always apply `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale`.
- Heading titles use negative letter tracking (`letter-spacing: -0.02em` through `-0.04em`) to achieve the signature Vercel/Linear look.
- Never use serifs anywhere in the public application.

---

## 4. Grid Systems & Spatial Metrics

### 4.1 Base Spacing Scale

Based on an 8-point harmonic grid:

- `4px` (`0.25rem`) — Micro gap, badge padding
- `8px` (`0.5rem`) — Element spacing, button padding-y
- `12px` (`0.75rem`) — Input inner padding
- `16px` (`1rem`) — Standard gutter, card compact padding
- `24px` (`1.5rem`) — Medium gap between grid items
- `32px` (`2rem`) — Card padding, section sub-gutters
- `48px` (`3rem`) — Large component separation
- `64px` (`4rem`) — Section top/bottom rhythm
- `96px` to `128px` — Major section padding on desktop

### 4.2 The "Vercel 1px Gap Grid" Pattern

Instead of individual card borders that clash when placed side-by-side, cards are placed inside a parent container:

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px; /* 1px gaps */
  background-color: rgba(255, 255, 255, 0.08); /* The line color */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
}

.grid-cell {
  background-color: #0c0c0c; /* Surface fills the cell */
  padding: 2rem;
  transition: background-color 200ms ease;
}

.grid-cell:hover {
  background-color: #141414;
}
```

---

## 5. Elevation, Borders & Atmospheric Lighting

### 5.1 Atmospheric Lighting Techniques

1. **Petrol Radial Glow (Hero Sections)**:
   ```css
   .hero-lighting {
     background-image: radial-gradient(
       ellipse 80% 60% at 50% -10%,
       rgba(19, 93, 97, 0.28) 0%,
       rgba(0, 0, 0, 0) 70%
     );
   }
   ```
2. **Subtle Faded Dot Matrix**:
   ```css
   .dot-grid {
     background-image: radial-gradient(
       rgba(255, 255, 255, 0.07) 1px,
       transparent 1px
     );
     background-size: 24px 24px;
     mask-image: radial-gradient(
       ellipse 60% 50% at 50% 40%,
       #000000 30%,
       transparent 80%
     );
   }
   ```

### 5.2 Micro-Borders

- Public surface borders are strictly `1px solid rgba(255, 255, 255, 0.08)`.
- On hover, borders brighten to `rgba(255, 255, 255, 0.16)`.
- Cards do not use drop-shadows; depth is achieved purely through color contrast and border illumination.

---

## 6. Core Component Specifications

### 6.1 Navigation Header (`SiteHeader`)

- **Container**: `sticky top-0 z-50`, height `64px`, full width.
- **Surface**: `rgba(0, 0, 0, 0.75)` with `backdrop-filter: blur(12px) saturate(180%)`.
- **Bottom Border**: `1px solid rgba(255, 255, 255, 0.08)`.
- **Logo**: Horizontal SVG lockup (`apps/web/public/brand/stack-and-scale-logo.svg`), height `34px`.
- **Nav Links**: Geist Sans `0.875rem`, weight `500`, color `var(--gray-300)`, hover transition to `#ffffff`.
- **CTA Button**: High-contrast white button (`bg-white text-black font-medium hover:bg-[#ededed]`).

### 6.2 Buttons (`Button` Component)

- **Primary**:
  - Background: `#ffffff`
  - Text: `#000000`
  - Border: none
  - Radius: `6px`
  - Hover: `background-color: #ededed; transform: translateY(-1px);`
- **Secondary (Outlined)**:
  - Background: `rgba(255, 255, 255, 0.04)`
  - Text: `#ededed`
  - Border: `1px solid rgba(255, 255, 255, 0.14)`
  - Radius: `6px`
  - Hover: `background-color: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.25);`
- **Ghost**:
  - Background: `transparent`
  - Text: `var(--gray-300)`
  - Hover: `color: #ffffff; background-color: rgba(255, 255, 255, 0.05);`

### 6.3 Monospace Status Badges

- Used for telemetry, status indications, and category tags:
  ```html
  <div
    class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-gray-300"
  >
    <span class="w-2 h-2 rounded-full bg-[#80ddd1] animate-pulse"></span>
    <span>SYSTEM STATUS: OPERATIONAL</span>
  </div>
  ```

### 6.4 Footer (`SiteFooter`)

- Multi-column layout with brand statement, navigation categories (Products, Services, Legal, Enterprise), status telemetry pill, and copyright.
- Color: `var(--gray-400)` with hover state `var(--gray-100)`.
- Top Border: `1px solid rgba(255, 255, 255, 0.08)`.

---

## 7. Page-by-Page Architectural Blueprints

### 7.1 Homepage (`/`)

1. **Hero**: Center-aligned typography, glowing radial petrol backdrop, dot matrix texture, status badge, dual CTA (Book Demo / Explore Solutions), enterprise trust badges.
2. **Platform Capabilities Grid**: 3-column Vercel-style 1px gap grid featuring:
   - Sovereign Cloud & AI Pipelines
   - High-throughput Inference
   - Enterprise RBAC & Security
3. **Core Methodology Section**: 3 dark cards outlining Architecture, Execution, and Governance.
4. **Interactive Feature Strip**: Horizontal pill buttons leading to deeper capability pages.
5. **Call to Action Panel**: Clean, centered conversion banner.

### 7.2 Solutions Page (`/solutions`)

1. **Hero**: Left-aligned high-impact typography with category filters.
2. **Solution Rows**: Stacked row cards with numeric badge, description, technology tags, and deep-link action button.

### 7.3 Approach Page (`/approach`)

1. **Hero**: Clear narrative explaining the Stack & Scale modular deployment philosophy.
2. **Phase Breakdown Grid**: 4 sequential numbered phases with step counters rendered in Geist Mono with Seafoam accent.

### 7.4 Authentication (`/signin`)

1. **Centered Minimalist Box**: Minimalist card container with dark inputs (`bg-black border-white/15 focus:border-white`).
2. **SSO Divider**: Clean 1px line with "OR CONTINUE WITH".
3. **Hardware / Enterprise SAML Buttons**: Minimal dark buttons.

### 7.5 Legal & Compliance Pages (`/privacy`, `/cookies`, `/terms`)

1. **Single Column Prose**: Maximum width `740px` for optimal reading ergonomics.
2. **Metadata Banner**: Effective date in Geist Mono.
3. **Headings & Callouts**: Styled dark blocks with high-contrast text.

---

## 8. Responsive Breakpoints & Layout Adaptations

| Breakpoint           | Width             | UI Adaptation                                                  |
| -------------------- | ----------------- | -------------------------------------------------------------- |
| **Desktop XL**       | `≥ 1280px`        | Full 3-column & 4-column grids, max-width `1200px` container   |
| **Desktop / Laptop** | `1024px – 1279px` | Standard grid layouts, container padding `2rem`                |
| **Tablet**           | `768px – 1023px`  | 2-column fallback for 3-col grids, responsive nav drawer       |
| **Mobile**           | `< 768px`         | Single-column cards, mobile navigation sheet, auto-height hero |

---

## 9. Staff & Internal Portal Isolation Policy

> [!IMPORTANT]
> The `/staff/*` and `/portal/*` operational dashboards are internal applications with their own distinct UI design language optimized for high-density administrative workflows.
>
> - **CSS Isolation**: All staff styles reside under `.staff-container`, `.staff-*`, and `.ops-*` selectors.
> - **Independence**: Modifying public marketing styles must NEVER touch or override staff selectors.
> - **Preservation**: Staff styles remain appended and fully functional at the end of `apps/web/app/globals.css`.

---

## 10. Developer Implementation Guidelines

When implementing or modifying UI components in the future:

1. **Always use Geist variables**: `font-sans` maps to `var(--font-geist-sans)`, `font-mono` to `var(--font-geist-mono)`.
2. **Do NOT introduce arbitrary bright colors**: Public UI colors should stick to `#000000`, grayscale tones, `#135d61` (petrol), and `#80ddd1` (seafoam).
3. **No Drop Shadows**: Use `border: 1px solid rgba(255, 255, 255, 0.08)` instead of `box-shadow`.
4. **Keep Logo Horizontal**: Always use the horizontal SVG logo `apps/web/public/brand/stack-and-scale-logo.svg` in top-level navigation.
