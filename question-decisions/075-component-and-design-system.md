# Question 075 — Component and design system

**Status:** Locked  
**Implementation:** Phase 0 and Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should Stack & Scale build a custom SDK or use open-source components?

## Your chosen direction

Use open-source primitives and curated components beneath an internally maintained company design-system layer.

## Why this was chosen

This avoids rebuilding accessibility primitives while retaining control over visual consistency and product-specific composition.

## Why it is a strong fit

- Faster implementation
- Lower lock-in
- Consistent brand and interaction standards

## Tradeoffs and safeguards

Imported components require licensing, accessibility, dependency and maintenance review.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 75 — Component/UI library strategy

Now we need to decide how we build the interface.

You already said you do **not** want to create your own SDK/component framework**, and you want open-source components.

Options:

### A. Use a complete UI framework

Examples:
- Material UI
- Ant Design

Fast, but many websites end up looking similar.

---

### B. Build from open-source primitives (recommended)

Example:

```text
shadcn/ui
+
Radix UI
+
Tailwind CSS
+
Motion
+
selected visual components
```

We own the component code and customize it.

---

### C. Use many component libraries together

Not recommended.

Creates:
- inconsistent design
- dependency problems
- large bundles

---

### D. Custom design system from scratch

Too much work and unnecessary.

---

My recommendation:

**B — open-source primitives + carefully curated components.**

This matches your original vision:

> "not customly making my own SDK, but using open-source libraries."

Architecture:

```text
Base
├── Radix primitives
├── shadcn/ui

Styling
├── Tailwind CSS

Animation
├── Motion

Special sections
├── selected open-source components
├── custom composition

Brand layer
├── your tokens
├── your visual identity
```

Do you want to lock **B — open-source primitives based UI architecture?**

#### Your response 1

> does maikiing the sdk or cusome is best or open-source primitives + carefully curated components.?

#### Explanation or resolution 1

For **your specific goal** (a premium software-house website + future SaaS ecosystem), I would **not choose either extreme**.

The best approach is:

> **Open-source primitives + your own internal design system layer (not a public SDK).**

So the answer is not:

❌ Build a complete custom UI SDK from scratch
or
❌ Randomly combine open-source components forever

It is:

✅ **Use open-source foundations, then create your own company design system on top.**

---

## Option 1 — Build your own full SDK/component library

Example:

```text
company-ui/

Button
Modal
Dropdown
Table
Form
Card
Input
DatePicker
Everything...
```

### Advantages

- Complete control
- Perfect consistency
- Reusable everywhere
- Could become a product asset

### Problems

This is expensive.

You now become responsible for:

- accessibility
- browser compatibility
- keyboard behavior
- mobile behavior
- testing
- documentation
- maintenance
- security fixes
- edge cases

A button sounds simple:

```tsx
<Button>
Save
</Button>
```

But a production button needs:

- disabled states
- loading states
- keyboard focus
- screen reader labels
- touch targets
- animations
- themes
- dark mode
- testing

Large companies like Google, Microsoft, Shopify, etc. build design systems because they have hundreds/thousands of developers.

For your current stage, a full SDK is a distraction.

---

## Option 2 — Random open-source components

Example:

Today:

```text
shadcn button
```

Tomorrow:

```text
another library card
```

Next:

```text
another animation package
```

Result:

```text
Website A:
rounded cards

Website B:
different cards

Dashboard:
different buttons
```

This creates inconsistency.

---

## Option 3 — Recommended: internal design system

This is what I recommend.

Architecture:

```text
Open-source foundation

Radix UI
      +
shadcn/ui
      +
Tailwind CSS
      +
Motion


              ↓


Your Company Design System


Brand tokens
├── Colors
├── Typography
├── Spacing
├── Radius
├── Shadows
├── Motion rules


Components
├── Button
├── Card
├── Navigation
├── Dashboard widgets
├── Forms
├── Tables
├── Product showcases
└── Marketing sections
```

The difference:

You are **not inventing basic engineering**.

You are creating your **company's visual language**.

---

Example:

Instead of:

```tsx
<ShadcnButton />
```

you create:

```tsx
<CompanyButton variant="primary">
Book Demo
</CompanyButton>
```

Internally:

```text
CompanyButton
       |
       ↓
shadcn Button
       |
       ↓
Radix primitive
```

If later you change the style:

Old:

```
blue rounded button
```

New:

```
black premium button
```

you change one place.

---

## For your four platforms:

This is ideal:

```
www.company.com
        |
        |
        ↓
 company-ui package


staff.company.com
        |
        |
        ↓
 company-ui package


portal.company.com
        |
        |
        ↓
 company-ui package


account.company.com
        |
        |
        ↓
 company-ui package
```

Everything feels like one ecosystem.

---

## My recommended stack for UI

I would lock:

```
Foundation:
React 19
Next.js
TypeScript

Styling:
Tailwind CSS

Primitives:
Radix UI

Component source:
shadcn/ui

Animation:
Motion

Icons:
Lucide

Special effects:
Magic UI / selected open-source components

3D:
React Three Fiber only where justified

Internal layer:
company-ui design system
```

---

## So Question 75 answer should be refined:

Not simply:

> B — open-source primitives based UI architecture

but:

> **B+ — open-source primitives + internally maintained company design system layer**

This gives you:

✅ speed
✅ professional quality
✅ consistency
✅ no vendor lock-in
✅ no unnecessary maintenance burden
✅ future scalability

For a software house trying to become a serious product company, this is the approach I would choose.

#### Your response 2

> okay thts greate

#### Explanation or resolution 2

Great. Locked refinement:

**Question 75 = B+ — open-source primitives + internally maintained company design system layer.**

This is now part of the architecture.

Final UI philosophy:

```text
Open Source Foundation
        │
        ├── Radix UI
        ├── shadcn/ui
        ├── Tailwind CSS
        ├── Motion
        └── selected open-source components

                ↓

Company Design System

        ├── Brand tokens
        │   ├── Colors
        │   ├── Typography
        │   ├── Spacing
        │   ├── Radius
        │   ├── Shadows
        │   └── Motion rules
        │
        └── Reusable components
            ├── Buttons
            ├── Forms
            ├── Tables
            ├── Cards
            ├── Navigation
            ├── Dashboard widgets
            ├── Product showcases
            ├── Data visualization
            └── Marketing sections
```

This gives you the best balance:

- You are **not wasting months rebuilding buttons, dialogs, dropdowns, accessibility logic, etc.**
- You are **not trapped in a generic template look**
- Your website, CRM, portals, and future products can feel like one ecosystem
- Your developers work faster
- Your brand remains unique

This is also how many mature product companies operate: they usually do not reinvent browser primitives; they build a strong internal layer on top of proven foundations.

---

We are now around **Question 75**, and the architecture is becoming very complete.

Remaining questions should be mostly about final engineering decisions:

- CMS/content modeling (Payload structure)
- exact repository tooling
- testing strategy
- CI/CD pipeline details
- deployment workflow
- secrets/environment management
- search technology
- caching strategy
- AI features inside the platform
- MVP phases (what to build first vs later)

After that, I will prepare the **complete Software House Platform Blueprint**:

1. Vision and positioning
2. Final tech stack
3. Subdomain architecture
4. Frontend architecture
5. Backend architecture
6. Database/domain model
7. CMS model
8. CRM/staff platform
9. Product/customer platform
10. API strategy
11. Security/privacy architecture
12. DevOps architecture
13. Deployment plan
14. Development roadmap (Phase 1 → Phase 5)

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
