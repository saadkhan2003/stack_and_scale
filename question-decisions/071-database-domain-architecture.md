# Question 071 — Database domain architecture

**Status:** Locked  
**Implementation:** Phase 1 and Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How should central platform data be organized?

## Your chosen direction

Use PostgreSQL as the core with a hybrid domain architecture and explicit ownership boundaries.

## Why this was chosen

One transactional database is practical initially, while domain separation prepares modules for independent scaling when necessary.

## Why it is a strong fit

- Strong consistency
- Lower operational overhead
- Clear evolution path

## Tradeoffs and safeguards

Poorly enforced module boundaries could turn the database into uncontrolled shared state.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 71 — Database architecture for your central platform

Now we need to decide the core database philosophy.

Your central platform (`staff`, `account`, `portal`, APIs, CRM, billing, subscriptions, etc.) will need a strong relational foundation.

Options:

**A. One shared PostgreSQL database**
All modules use one database.

**B. PostgreSQL with modular boundaries**
One database initially, but each domain has clear separation:

```text
CRM tables
Billing tables
Project tables
Support tables
Auth tables
Product tables
```

**C. Separate databases from day one**
CRM, billing, support, etc. each have independent databases/services.

**D. Hybrid domain architecture**
Start with a modular PostgreSQL core, but design boundaries so high-scale modules can split into separate services/databases later.

My recommendation for your stage:

**D.**

Reason:

Starting with many databases/services creates unnecessary operational complexity, but a single messy database becomes a legacy problem.

So we build:

```text
Central Platform

PostgreSQL

├── Identity domain
├── Organization domain
├── CRM domain
├── Billing domain
├── Project domain
├── Support domain
├── Notification domain
├── File metadata domain
└── Product integration domain
```

with clear ownership.

Later:

```text
Billing Service
       ↓
Billing Database

Support Service
       ↓
Support Database
```

without rewriting everything.

Do you want to lock **D — hybrid domain architecture with PostgreSQL core?**

#### Your response 1

> i dirnot underdsrand

#### Explanation or resolution 1

No problem. This is an important architecture decision, so I will explain it simply.

Your platform will have many parts:

```text
staff.company.com
├── CRM (leads/customers)
├── Billing (invoices/payments)
├── Projects
├── Support tickets
├── Subscriptions
├── Notifications
├── Files
├── Users/permissions
└── Product integrations
```

The question is: **how should we store their data?**

---

### Option A — One big messy database ❌

Everything mixed together:

```text
PostgreSQL

customers
payments
tickets
projects
users
files
subscriptions
everything...
```

At the beginning this is easy.

But after years:

- thousands of tables
- difficult changes
- developers accidentally break other areas
- hard to scale

This becomes a legacy system.

---

### Option B — Separate database for everything from day one ❌

Like:

```text
CRM
   ↓
CRM Database

Billing
   ↓
Billing Database

Support
   ↓
Support Database

Projects
   ↓
Projects Database
```

This sounds professional, but for a new company it creates unnecessary complexity:

- more servers
- more backups
- more deployments
- more monitoring
- difficult communication between systems

You don't need this yet.

---

### Option D — Hybrid domain architecture ✅ (recommended)

We use **one PostgreSQL database initially**, but we organize it like separate systems internally.

Think of it like a large office building:

```text
PostgreSQL

Floor 1:
Identity
(users, login, permissions)

Floor 2:
CRM
(leads, customers)

Floor 3:
Billing
(invoices, payments)

Floor 4:
Projects
(milestones, tasks)

Floor 5:
Support
(tickets)

Floor 6:
Products
(subscriptions, licenses)
```

They are in the same building, but each department has:

- its own rules
- its own tables
- its own code
- its own permissions

Example:

```text
crm

crm_leads
crm_customers
crm_activities


billing

billing_invoices
billing_payments
billing_subscriptions


support

support_tickets
support_messages
```

---

Later, if your company becomes very large:

Example:

Your billing system becomes huge.

Instead of:

```text
Main Platform
    |
    PostgreSQL
        |
        Billing
```

we can move it:

```text
Main Platform

CRM
Projects
Support

        API

        ↓

Separate Billing Service
        |
        ↓
Billing Database
```

without rebuilding everything.

---

A simple analogy:

Building a city:

❌ Bad:
One giant building where every company department is mixed.

❌ Also bad:
Build 20 separate buildings before you have employees.

✅ Good:
Build one large building with properly separated offices, so departments can move into their own buildings later if needed.

---

So for your software house platform:

**Now:**

```text
Hetzner

Next.js apps
     |
Payload / Backend
     |
PostgreSQL

Schemas:
- auth
- crm
- billing
- projects
- support
- products
```

**Future:**

If one part grows massively:

```text
Billing → separate service
Support → separate service
Analytics → separate data warehouse
```

---

So the lock means:

✅ PostgreSQL as the main database
✅ Clear separation between business domains
✅ No spaghetti database
✅ Easy future scaling into separate services

I recommend locking this.

**Question 71 = D — hybrid domain architecture with PostgreSQL core.**

#### Your response 2

> D

#### Explanation or resolution 2

Locked: **Question 71 = D — hybrid domain architecture with PostgreSQL core.**

This is a very important long-term decision.

Final direction:

```text
Central Platform

Next.js Applications
│
├── www.company.com
├── staff.company.com
├── portal.company.com
└── account.company.com

        ↓

Backend/API Layer

        ↓

PostgreSQL Core

├── Identity Domain
│   ├── users
│   ├── roles
│   ├── permissions
│   └── sessions
│
├── Organization Domain
│   ├── companies
│   ├── branches
│   └── memberships
│
├── CRM Domain
│   ├── leads
│   ├── customers
│   ├── activities
│   └── pipelines
│
├── Billing Domain
│   ├── invoices
│   ├── payments
│   ├── subscriptions
│   └── plans
│
├── Project Domain
│   ├── projects
│   ├── milestones
│   ├── tasks
│   └── releases
│
├── Support Domain
│   ├── tickets
│   ├── messages
│   └── SLA
│
├── Product Domain
│   ├── products
│   ├── licenses
│   ├── instances
│   └── entitlements
│
├── Notification Domain
│   ├── events
│   ├── preferences
│   └── delivery logs
│
└── Audit Domain
    ├── security events
    └── business changes
```

The important rule:

> Each domain owns its logic. Shared database does not mean shared uncontrolled code.

This avoids a future legacy system while keeping operations realistic.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
