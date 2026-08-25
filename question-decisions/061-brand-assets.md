# Question 061 — Brand assets

**Status:** Locked  
**Implementation:** Phase 0  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Which parts of the visual identity are already finalized?

## Your chosen direction

Treat the existing logo and color palette as approved inputs; define typography and the wider identity during the design-system phase.

## Why this was chosen

This preserves completed brand work while acknowledging that a production interface needs more than a logo and colors.

## Why it is a strong fit

- Avoids unnecessary rebranding
- Creates a coherent type and spacing system
- Makes the design implementable

## Tradeoffs and safeguards

Existing colors still require accessibility and digital-use validation.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 61 — Brand identity

Do you already have a **final company name, logo, brand colors, typography, and visual identity**, or should we design the website architecture so the branding can be finalized/replaced later without rebuilding components?

My recommendation, especially because you want a premium unique site, is:

**build a token-based brand system from day one**, for example:

```text
Brand tokens
├── Primary colors
├── Secondary/accent colors
├── Light/dark surfaces
├── Typography
├── Border radius
├── Shadows
├── Spacing
├── Motion timing
└── Illustration/visual language
```

Then changing your brand later means updating tokens rather than rewriting hundreds of components.

Do you already have a finalized brand, or should we make the branding **fully swappable for now**?

#### Your response

> yes i finlized the logo..and color pallet ...but not the typography and visual identity for now....and i dindot finilzie other thigns further more

#### Explanation or resolution

Good. Locked: **Question 61 = finalized logo + color palette exist; typography and full visual identity remain to be defined.**

This is actually the ideal situation. We should **not redesign the logo/colors**. Instead, we create a complete **design system around your existing brand assets**.

The approach:

```text
Existing
├── Logo ✓
├── Color palette ✓

To define
├── Typography system
├── Font pairing
├── Heading hierarchy
├── Body text style
├── UI style
├── Card language
├── Button style
├── Border radius
├── Shadows
├── Motion language
├── Illustration style
├── Icon style
├── Product showcase style
└── Photography/visual rules
```

The goal is that the website does not feel like:

> "We selected a Tailwind template and changed the colors."

Instead, every component should feel like the same company.

For example:

### Typography system

We decide:

```text
Hero heading
→ distinctive display font

Section headings
→ strong modern sans

Body
→ highly readable UI font

Dashboard/UI text
→ compact technical font
```

Possible directions:

- **Premium technology** (Linear/Vercel style)
- **Enterprise software** (Stripe/IBM style)
- **Modern product company** (Notion/Figma style)
- **Human business software** (friendly but professional)

---

### Visual identity

We define things like:

**Product visuals**

Instead of:

```text
Screenshot
↓
rounded rectangle
↓
caption
```

we create:

```text
Software experience

Browser frame
+
device mockups
+
interaction states
+
metrics
+
workflow visualization
```

---

### Motion language

Since we selected premium motion + selective 3D:

We define rules:

```text
Buttons
→ subtle feedback

Cards
→ smooth hover

Sections
→ scroll reveal

Product demos
→ richer animation

Hero
→ highest visual impact

No:
❌ random animations everywhere
❌ distracting effects
❌ slow loading
```

---

### Design token approach

Everything becomes configurable:

```text
Brand
├── Colors
├── Typography
├── Spacing
├── Radius
├── Shadows
├── Motion
└── Components
```

So if later you refine the brand identity, we update the system instead of rewriting the website.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
