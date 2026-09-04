# Architecture Decision Record: Vercel & Linear-Inspired Dark UI/UX Redesign

- **Status**: Accepted & Implemented
- **Date**: 2026-09-04
- **Deciders**: Engineering & Product Team
- **Technical Context**: Next.js 16 (App Router), Tailwind CSS v4 / PostCSS, Geist Font System

---

## 1. Context and Problem Statement

Stack & Scale's initial web interface utilized an editorial "Sand & Serif" theme (`#f5f2e8` background with Georgia serif typography). While classic, market research and direct user feedback indicated:

1. Enterprise buyers and engineers looking for AI infrastructure and cloud orchestration associate modern developer platforms (such as [Vercel](https://vercel.com) and [Linear](https://linear.app)) with speed, technical rigor, and precision.
2. The serif typography and light tan canvas did not communicate high-performance infrastructure capability.
3. The brand logo in navigation needed a horizontal vector lockup to fit standard 64px header bars without awkward distortion or clipping.

---

## 2. Decision Drivers

- **Developer & Technical Credibility**: Establish an immediate visual parity with world-class developer tools and infrastructure platforms.
- **Design Consistency**: Standardize on a dark-first color system, 1px subtle borders, atmospheric petrol radial glows, and high-contrast typography.
- **Modern Typography**: Eliminate serif fallbacks in favor of Geist Sans for UI clarity and Geist Mono for telemetry, metrics, and badges.
- **Preservation of Internal Operations**: Internal staff dashboards (`/staff/*`) have complex administrative layouts and must remain unaffected by public marketing visual shifts.

---

## 3. Considered Options

1. **Option A: Incremental CSS Tweaks on Editorial Theme**
   - Keep Sand canvas but darken buttons.
   - _Verdict_: Rejected. Half-measures fail to establish modern infrastructure positioning.
2. **Option B: Full Tailwind CSS Component Library Migration (shadcn/ui wholesale)**
   - Re-scaffold the entire frontend with shadcn/ui.
   - _Verdict_: Rejected. Would break existing route models, SEO schemas, and internal portal flows.
3. **Option C: Targeted Vercel & Linear Redesign (Selected)**
   - Adopt pitch black (`#000000`) and carbon (`#111111`) foundational surfaces.
   - Integrate official `geist` font package (`GeistSans` and `GeistMono`).
   - Implement horizontal SVG logo lockup with white/gray contrast.
   - Refactor `apps/web/app/globals.css` into modular design tokens with Vercel 1px gap grid systems.
   - Strictly isolate `/staff/*` CSS rules to avoid regressions.

---

## 4. Decision Outcome

**Chosen Option**: **Option C**.

### Key Architectural Changes Implemented:

1. **Font Pipeline**: Installed and configured the `geist` package in `apps/web/app/layout.tsx`. Geist Sans and Geist Mono are injected into root HTML variables `--font-geist-sans` and `--font-geist-mono`.
2. **Design Tokens in `globals.css`**:
   - Replaced Sand canvas with `--night: #000000` and surface `--gray-900: #111111`.
   - Retained brand accent roles: `--petrol: #135d61` for radial ambient lighting, `--seafoam: #80ddd1` for status pulses and badges.
   - Replaced heavy drop shadows with 1px translucent borders (`rgba(255, 255, 255, 0.08)`).
3. **Horizontal Vector Logo**:
   - Updated `apps/web/public/brand/stack-and-scale-logo.svg` to feature horizontal orientation with high-contrast `#EDEDED` typography for dark headers.
   - Archived square high-res raster asset as `apps/web/public/brand/stack-and-scale-logo-square.jpg`.
4. **Staff Styles Preservation**:
   - Appended and safeguarded all `.staff-*` and `.ops-*` CSS rules to ensure administrative interfaces remain 100% operational and visually intact.

---

## 5. Pros and Cons of the Selected Architecture

### Positive Consequences

- Immediate enterprise and developer credibility matching Vercel and Linear standards.
- Enhanced contrast and readability across mobile and desktop devices.
- Reusable 1px gap grid pattern simplifies adding new product and solutions cards without CSS conflicts.
- High build performance: Next.js static page generation builds in under 16 seconds with zero bundle bloat.

### Negative Consequences / Risks

- Developers adding new pages must follow dark-mode token standards (documented in `docs/design/UI-UX-SYSTEM.md`) to avoid introducing outdated light styles.
