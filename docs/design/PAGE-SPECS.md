# Page-by-Page Specifications & Layout Blueprints

> This document defines the exact layout, content model, styling hooks, and responsive behavior for each route in `apps/web/app/`.

---

## 1. Homepage (`/`)

**File**: `apps/web/app/page.tsx`  
**Layout Shell**: `.site-shell`

### Visual Hierarchy

```
┌────────────────────────────────────────────────────────┐
│ SiteHeader (Sticky Blur Nav)                           │
├────────────────────────────────────────────────────────┤
│ HERO SECTION                                           │
│  [Status Pill: AI Sovereignty Platform]                │
│  H1: Infrastructure for the Autonomous Enterprise       │
│  P: Deploy private AI models, deterministic workflows  │
│  Buttons: [Book a Demo] [Explore Solutions →]         │
│  Trust Row: SOC 2 • HIPAA Ready • Zero Data Retention │
├────────────────────────────────────────────────────────┤
│ CAPABILITIES GRID (3-Column 1px Gap)                   │
│  [01 Private Clusters] [02 Model Serving] [03 Ledger] │
├────────────────────────────────────────────────────────┤
│ APPROACH HIGHLIGHTS                                    │
│  [01 Security] [02 Velocity] [03 Control]              │
├────────────────────────────────────────────────────────┤
│ FEATURE PILLS (Horizontal Navigation Links)            │
├────────────────────────────────────────────────────────┤
│ CALL TO ACTION BANNER                                  │
├────────────────────────────────────────────────────────┤
│ SiteFooter                                             │
└────────────────────────────────────────────────────────┘
```

### Key CSS Classes & Elements

- `.site-shell`: Root container with `background: #000000` and `color: #ededed`.
- `.hero`: Radial gradient background (`--petrol` at top center), centered text, dot grid texture.
- `.hero-title`: Large clamp heading with white-to-translucent gradient fill.
- `.capability-grid`: 3-column container with 1px border gap seam.
- `.approach`: Radial background glow, dark cards with `#111` background and hover transitions.
- `.feature-strip`: Flex wrap of pill buttons for secondary feature exploration.

---

## 2. Solutions Page (`/solutions`)

**File**: `apps/web/app/solutions/page.tsx`  
**Layout Shell**: `.solutions-page`

### Visual Hierarchy

```
┌────────────────────────────────────────────────────────┐
│ SiteHeader                                             │
├────────────────────────────────────────────────────────┤
│ SOLUTIONS HERO                                         │
│  Category Eyebrow: ENTERPRISE SOLUTIONS                │
│  H1: Purpose-built architectures for scale             │
│  P: Deep description of enterprise offerings          │
├────────────────────────────────────────────────────────┤
│ SOLUTIONS LIST (Stacked 1px Seam Rows)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 01 // SOVEREIGN AI DEPLOYMENT                    │  │
│  │ Private VPC clusters, on-premise inference, zero │  │
│  │ data exfiltration architecture.                  │  │
│  │ [Learn More →]                                   │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ 02 // DETERMINISTIC AGENT WORKFLOWS              │  │
│  │ Orchestrate multi-step LLM operations with       │  │
│  │ verifiable state machines and replayability.     │  │
│  │ [Learn More →]                                   │  │
│  └──────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│ SiteFooter                                             │
└────────────────────────────────────────────────────────┘
```

### Key Specifications

- Hero is left-aligned with a maximum width of `800px` for rapid scanning.
- Solutions list uses row-based cards with monospace index badges (`01 //`, `02 //`).
- Each row contains title, description, technical badges, and deep link button.

---

## 3. Approach Page (`/approach`)

**File**: `apps/web/app/approach/page.tsx`  
**Layout Shell**: `.approach-page`

### Visual Hierarchy

```
┌────────────────────────────────────────────────────────┐
│ SiteHeader                                             │
├────────────────────────────────────────────────────────┤
│ APPROACH HERO                                          │
│  Eyebrow: ENGINEERING METHODOLOGY                      │
│  H1: How we engineer sovereign systems                 │
│  P: Modular deployment philosophy and security         │
├────────────────────────────────────────────────────────┤
│ 4-PHASE SEQUENCE (Responsive Grid)                     │
│  [Step 1: Discover] [Step 2: Architecture]             │
│  [Step 3: Deploy]   [Step 4: Scale & Govern]           │
├────────────────────────────────────────────────────────┤
│ APPROACH CLOSE CTA                                     │
├────────────────────────────────────────────────────────┤
│ SiteFooter                                             │
└────────────────────────────────────────────────────────┘
```

### Key Specifications

- Step indicators render step numbers (`01`, `02`, `03`, `04`) in `var(--font-geist-mono)` with `--seafoam` highlight.
- Step cards feature high-contrast headlines and structured deliverables lists.

---

## 4. Authentication / Sign In (`/signin`)

**File**: `apps/web/app/signin/page.tsx` & `apps/web/src/signin-view.tsx`  
**Layout Shell**: `.signin-page`

### Visual Hierarchy

```
┌────────────────────────────────────────────────────────┐
│ SiteHeader                                             │
├────────────────────────────────────────────────────────┤
│ CENTERED CARD CONTAINER                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Stack & Scale Logo Lockup                        │  │
│  │ H1: Sign in to your account                      │  │
│  │ Email Input [___________________________]        │  │
│  │ Password Input [________________________]        │  │
│  │ [Continue with Email]                            │  │
│  │ ─────── OR CONTINUE WITH ───────                 │  │
│  │ [Enterprise SSO (SAML / Okta)]                   │  │
│  │ Terms and Privacy Disclaimer                     │  │
│  └──────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│ SiteFooter                                             │
└────────────────────────────────────────────────────────┘
```

### Key Specifications

- Centered layout on full-height dark viewport.
- Card has `#0d0d0d` background with `1px solid rgba(255,255,255,0.12)`.
- Input fields are pitch black with subtle borders and clear focus states.

---

## 5. Error, 404, Loading, and Maintenance States

### 5.1 404 Not Found (`/not-found`)

- **File**: `apps/web/app/not-found.tsx`
- **Design**: Huge numeric display `404` in `clamp(4rem, 10vw, 8rem)` with gradient text fill.
- **Action**: Secondary outline button "Back to Home".

### 5.2 Error Boundary (`/error`)

- **File**: `apps/web/app/error.tsx`
- **Design**: Minimalist centered warning with reset button and error digest reference.

### 5.3 Loading Suspense (`/loading`)

- **File**: `apps/web/app/loading.tsx`
- **Design**: Subtle 24px spinner with white border and transparent quarter arc rotating infinitely.

### 5.4 Maintenance Mode (`/maintenance`)

- **File**: `apps/web/app/maintenance/page.tsx`
- **Design**: Monospace status tag "SCHEDULED MAINTENANCE", progress indicator, and support contact link.

---

## 6. Legal & Policy Pages (`/privacy`, `/cookies`, `/terms`)

**Files**:

- `apps/web/app/privacy/page.tsx`
- `apps/web/app/cookies/page.tsx`
- `apps/web/app/terms/page.tsx`

### Layout Shell: `.legal-page`

- **Container**: Centered prose layout with `max-width: 740px`.
- **Typography**: Geist Sans body copy with generous line-height (`1.75`) for comfortable long-form reading.
- **Headings**: `h2` and `h3` styled with tight tracking and clear vertical rhythm.
- **Effective Date**: Formatted in `var(--font-geist-mono)` with `--gray-400` color.
