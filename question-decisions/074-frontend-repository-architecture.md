# Question 074 — Frontend repository architecture

**Status:** Locked  
**Implementation:** Phase 0  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should applications use separate repositories or a monorepo?

## Your chosen direction

Use a monorepo with independently deployable applications and shared packages.

## Why this was chosen

The website, portals, staff app, contracts and design system will share standards but need separate releases.

## Why it is a strong fit

- Consistent tooling
- Safe shared packages
- Atomic cross-application changes

## Tradeoffs and safeguards

Shared code must not tightly couple every deployment or create circular dependencies.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 74 — Frontend application architecture

Now we need to decide how we structure the frontend codebase.

Because you will have:

- public website
- staff portal
- client portal
- customer account
- future products

Options:

### A. Separate repositories

```text
website-repo
staff-repo
portal-repo
account-repo
```

### B. Monorepo (recommended)

One repository:

```text
company-platform/

apps/
├── website
├── staff
├── portal
└── account

packages/
├── ui
├── auth
├── api-client
├── config
└── utilities
```

### C. Micro-frontends

Separate frontend applications that load together.

Too complex now.

---

My recommendation:

**B — monorepo with shared packages.**

Reason:

- consistent design system
- shared authentication
- shared API client
- shared components
- easier CI/CD
- easier developer onboarding

Do you want to lock **B — monorepo architecture?**

#### Your response

> B

#### Explanation or resolution

Locked: **Question 74 = B — monorepo frontend architecture with shared packages.**

This fits your long-term vision very well.

We will avoid having four completely separate frontend codebases that slowly become inconsistent.

Instead:

```text
company-platform/

apps/

├── website
│   └── www.company.com
│
├── staff
│   └── staff.company.com
│
├── portal
│   └── portal.company.com
│
└── account
    └── account.company.com


packages/

├── ui
│   └── shared components
│
├── design-tokens
│   └── colors, typography, spacing
│
├── auth
│   └── authentication logic
│
├── api-client
│   └── typed API communication
│
├── validation
│   └── shared schemas
│
├── email-components
│   └── React Email system
│
└── config
    └── common tooling
```

Benefits:

### Consistent brand

The same design language everywhere:

```text
www.company.com
        ↓
staff.company.com
        ↓
portal.company.com
        ↓
account.company.com
```

They feel like one ecosystem.

---

### Shared engineering

Instead of rewriting:

Authentication:

```text
website login
staff login
portal login
account login
```

we share the same secure auth package.

---

### Shared components

Example:

```text
Button
Modal
Table
Form
Dashboard Card
File Upload
Notification Center
```

are maintained once.

---

### Better developer experience

A new developer joins:

```bash
git clone company-platform

pnpm install

pnpm dev
```

Everything is available.

---

### Future product connection

Later:

```text
company-platform

apps/

├── website
├── staff
├── portal
├── account
├── pos-dashboard
└── analytics-platform
```

can live together if appropriate.

---

However, important distinction:

Your **customer products** (POS, tailor software, SaaS products) do not have to live inside this monorepo.

Remember our earlier decision:

```text
Central Company Platform
        |
        |
    APIs
        |
        |
Independent Products
```

The monorepo is mainly for your **company ecosystem**, not forcing every future product into one codebase.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
