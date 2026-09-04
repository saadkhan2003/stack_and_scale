# Component Catalog — Vercel & Linear Design System (v2.0)

> This catalog details every UI component used in the public marketing and application shell of Stack & Scale. Reference this document when implementing new features or modifying existing UI elements.

---

## 1. Global Navigation (`SiteHeader`)

**File**: `apps/web/src/site-header.tsx`  
**Selector / Classes**: `.site-header`, `.site-header-inner`

### Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [SVG Logo (34px)]   Products   Services   Industries   Approach   [Book Demo]│
└─────────────────────────────────────────────────────────────────────────────┘
```

### Specifications

- **Position**: `sticky top-0 z-50`
- **Height**: `64px` (`4rem`)
- **Background**: `rgba(0, 0, 0, 0.75)` with `backdrop-filter: blur(12px) saturate(180%)`
- **Border**: Bottom `1px solid rgba(255, 255, 255, 0.08)`
- **Logo Component**: Horizontal lockup SVG (`/brand/stack-and-scale-logo.svg`) with `#EDEDED` brand text and `#888888` subtext.
- **Nav Links**:
  - Font: `var(--font-geist-sans)`, `0.875rem`, Weight: `500`
  - Color: `var(--gray-300)` (`#888888`)
  - Hover Color: `#ffffff` (`transition: color 150ms ease`)
- **Action Button**: Primary pill button (`bg-white text-black font-medium hover:bg-[#ededed]`)

### Usage Example

```tsx
import { SiteHeader } from "@/src/site-header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
    </>
  );
}
```

---

## 2. Global Footer (`SiteFooter`)

**File**: `apps/web/src/site-footer.tsx`  
**Selector / Classes**: `.site-footer`, `.site-footer-inner`

### Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Stack & Scale               Products          Legal           Enterprise   │
│ Sovereign AI Infrastructure  Sovereign AI      Privacy Policy  SOC 2 Cert   │
│                              Inference API     Cookie Policy   ISO 27001    │
│ [● System Status]            Edge Gateway      Terms of Service Status API  │
│                                                                             │
│ © 2026 Stack & Scale Technologies Inc. All rights reserved.                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Specifications

- **Grid Layout**: 4-column responsive grid (`2fr 1fr 1fr 1fr` on desktop, `1fr` on mobile).
- **Background**: `#000000`
- **Border**: Top `1px solid rgba(255, 255, 255, 0.08)`
- **Link Styling**: `var(--gray-400)` (`#666666`), hover to `#ededed`
- **Status Indicator**: Monospace badge with a seafoam pulse dot (`#80ddd1`).

---

## 3. Hero Sections (`.hero`)

### Hero Variants

1. **Homepage Hero** (`.hero`): Center-aligned, maximum impact with radial petrol glow and dot-grid backdrop.
2. **Page Hero** (`.solutions-hero`, `.approach-hero`): Left-aligned with structured category pills and secondary metadata.

### Hero Specs

```css
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 6rem 1.5rem 5rem;
  background-image: radial-gradient(
    ellipse 80% 60% at 50% -15%,
    rgba(19, 93, 97, 0.28) 0%,
    rgba(0, 0, 0, 0) 70%
  );
  overflow: hidden;
}
```

### Hero Elements

- **Eyebrow Badge**:
  - Class: `.hero-badge` or `.eyebrow`
  - Font: `var(--font-geist-mono)`, `0.75rem`, letter-spacing: `0.08em`
  - Background: `rgba(255, 255, 255, 0.04)`
  - Border: `1px solid rgba(255, 255, 255, 0.1)`
  - Text: Seafoam (`#80ddd1`)
- **Headline (`h1`)**:
  - Size: `clamp(2.5rem, 5.5vw, 4.5rem)`
  - Weight: `700` or `800`
  - Tracking: `-0.04em`
  - Fill: `linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.70) 100%)`
  - Webkit-background-clip: `text`
- **Lead Text (`.hero-description`)**:
  - Size: `1.125rem` to `1.25rem`
  - Max Width: `680px`
  - Color: `var(--gray-300)` (`#888888`)
- **CTA Actions (`.hero-actions`)**:
  - Flex container with gap `12px`
  - Primary button (`white`) + Secondary button (`glass border`)

---

## 4. Cards & 1px Gap Grid Pattern (`.capability-grid`, `.approach-steps`)

The signature Vercel layout pattern avoids double borders and inconsistent card seams.

### Layout Code

```html
<div class="capability-grid">
  <div class="capability-card">
    <div class="card-mono-badge">01 // PLATFORM</div>
    <h3>Sovereign Cloud & Clusters</h3>
    <p>Isolated enterprise VPC instances with zero-trust networking.</p>
  </div>
  <div class="capability-card">
    <div class="card-mono-badge">02 // INFERENCE</div>
    <h3>High-Throughput Serving</h3>
    <p>Sub-millisecond model invocation pipelines with vLLM acceleration.</p>
  </div>
  <div class="capability-card">
    <div class="card-mono-badge">03 // GOVERNANCE</div>
    <h3>Cryptographic Audit Logs</h3>
    <p>Immutable ledger of all AI agent interactions and API queries.</p>
  </div>
</div>
```

### CSS Implementation

```css
.capability-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background-color: rgba(255, 255, 255, 0.08); /* 1px seam color */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
}

.capability-card {
  background-color: #0b0b0b;
  padding: 2.5rem 2rem;
  transition: background-color 200ms ease;
}

.capability-card:hover {
  background-color: #141414;
}

@media (max-width: 900px) {
  .capability-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 5. Buttons & Interactive Controls (`Button`)

**File**: `packages/ui/src/button.tsx` or `@/components/ui/button`

### Variants

#### Primary Button

- Used for primary conversions: "Book a Demo", "Get Started", "Submit"
- Classes / CSS:
  ```css
  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 42px;
    padding: 0 1.25rem;
    background-color: #ffffff;
    color: #000000;
    font-family: var(--font-geist-sans);
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 6px;
    border: none;
    transition: all 150ms ease;
  }
  .btn-primary:hover {
    background-color: #ededed;
    transform: translateY(-1px);
  }
  ```

#### Secondary (Outline) Button

- Used for exploratory actions: "View Solutions", "Documentation", "Cancel"
  ```css
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 42px;
    padding: 0 1.25rem;
    background-color: rgba(255, 255, 255, 0.03);
    color: #ededed;
    font-family: var(--font-geist-sans);
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    transition: all 150ms ease;
  }
  .btn-secondary:hover {
    background-color: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.28);
  }
  ```

#### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: var(--gray-300);
  border: none;
}
.btn-ghost:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.06);
}
```

---

## 6. Form Inputs (`.form-group`, `.input-dark`)

### Specifications for Dark Mode Form Controls

- **Background**: `#000000` or `#0a0a0a`
- **Border**: `1px solid rgba(255, 255, 255, 0.15)`
- **Radius**: `6px`
- **Height**: `40px`
- **Text Color**: `#ededed`
- **Placeholder**: `var(--gray-500)` (`#444444`)
- **Focus Ring**: `border-color: rgba(255, 255, 255, 0.6); outline: none;`
- **Labels**: `0.8125rem`, `font-medium`, `var(--gray-300)`

---

## 7. Badges & Status Indicators

### Monospace Telemetry Badge

```tsx
<div className="badge-telemetry">
  <span className="dot dot-seafoam" />
  <span>SOC-2 TYPE II CERTIFIED</span>
</div>
```

```css
.badge-telemetry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  font-family: var(--font-geist-mono);
  font-size: 0.75rem;
  color: var(--gray-300);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.dot-seafoam {
  background-color: #80ddd1;
  box-shadow: 0 0 8px rgba(128, 221, 209, 0.6);
}
```

---

## 8. Modal & Dialog Overlays

- **Backdrop**: `rgba(0, 0, 0, 0.8)` with `backdrop-filter: blur(8px)`
- **Dialog Surface**: `#0c0c0c` with `border: 1px solid rgba(255, 255, 255, 0.12)`
- **Border Radius**: `12px`
- **Padding**: `2rem`
- **Entrance Motion**: `opacity: 0 -> 1`, `scale: 0.98 -> 1.0` (duration `150ms ease-out`)
