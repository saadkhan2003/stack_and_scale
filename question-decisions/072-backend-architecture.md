# Question 072 — Backend architecture

**Status:** Locked  
**Implementation:** Phase 1 onward  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should the backend be a monolith, microservices, or modular monolith?

## Your chosen direction

Use a modular monolith initially.

## Why this was chosen

The platform has many domains but does not yet need the deployment and consistency costs of microservices.

## Why it is a strong fit

- Faster development
- Clear domain boundaries
- Modules can be extracted later if evidence demands it

## Tradeoffs and safeguards

Module ownership and dependency rules must be enforced or the architecture will degrade into a conventional monolith.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 72 — Backend architecture choice

Now we need to decide the backend technology for the central platform.

Since we already selected:

- Next.js frontend
- TypeScript
- PostgreSQL
- API-first architecture
- Payload CMS
- Hetzner infrastructure

Possible approaches:

### A. Next.js full-stack only

Everything inside Next.js:

```text
Next.js
├── Frontend
├── API routes
├── Server actions
└── Database access
```

Pros:
- simple
- fast development

Cons:
- can become harder as CRM/billing/products/support grow.

---

### B. Dedicated backend service

Example:

```text
Frontend
   ↓
API Backend
   ↓
PostgreSQL
```

Backend options:
- NestJS (TypeScript)
- Fastify
- AdonisJS
- Django
- Laravel

Pros:
- clearer architecture
- easier API-first development
- better for many applications integrating later

Cons:
- more initial setup

---

### C. Microservices from day one

Example:

```text
CRM Service
Billing Service
Support Service
Auth Service
```

I do **not recommend this now**.

Too much complexity.

---

### D. Modular monolith (my recommendation)

A single backend application, but internally organized like separate domains:

```text
Backend

modules/
├── auth
├── organizations
├── crm
├── billing
├── projects
├── support
├── products
├── notifications
└── audit
```

Later any module can become a separate service if needed.

This matches our database decision.

For your company platform, I recommend:

**D — modular monolith backend.**

A likely stack:

```text
Backend:
NestJS + TypeScript

Database:
PostgreSQL

ORM:
Prisma or Drizzle

Validation:
Zod

API:
REST + OpenAPI
(WebSockets only where useful)

Background jobs:
BullMQ + Redis
```

Do you want to lock **D — modular monolith backend architecture?**

#### Your response

> D

#### Explanation or resolution

Locked: **Question 72 = D — modular monolith backend architecture.**

This is the right balance for your stage and ambition.

We avoid two extremes:

❌ **Simple but messy full-stack app**

```text
Next.js
 ├── pages
 ├── random API routes
 ├── database queries everywhere
 └── business logic mixed together
```

This becomes difficult to maintain.

❌ **Premature microservices**

```text
CRM service
Billing service
Support service
Auth service
...
```

Too much operational complexity before you need it.

✅ **Modular monolith**

A single deployable backend, but internally structured like a future large system:

```text
Backend

src/
├── modules/
│
├── auth/
│   ├── users
│   ├── sessions
│   └── permissions
│
├── organizations/
│   ├── companies
│   ├── branches
│   └── memberships
│
├── crm/
│   ├── leads
│   ├── customers
│   ├── pipeline
│   └── activities
│
├── billing/
│   ├── invoices
│   ├── payments
│   ├── subscriptions
│   └── plans
│
├── projects/
│   ├── projects
│   ├── milestones
│   └── tasks
│
├── support/
│   ├── tickets
│   └── messages
│
├── products/
│   ├── licenses
│   ├── instances
│   └── entitlements
│
├── notifications/
│
└── audit/
```

Each module has:

- its own business rules
- services
- database access layer
- validation
- permissions
- tests

---

Final backend direction:

```text
Frontend

Next.js + React + TypeScript


        ↓


Backend API

NestJS + TypeScript


        ↓


Data Layer

PostgreSQL
+
Prisma/Drizzle


        ↓


Infrastructure

Redis
Background Jobs
Object Storage
Email Service
```

---

Why this is especially good for your software house:

Your future products can integrate with the same API style:

```text
Retail POS
      ↓
api.company.com

Tailor App
      ↓
api.company.com

AI Product
      ↓
api.company.com
```

while your internal platform remains maintainable.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
