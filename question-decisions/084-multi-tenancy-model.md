# Question 084 — Multi-tenancy model

**Status:** Locked  
**Implementation:** Foundation in Phase 1; expanded in Phase 3 and Phase 4  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

What tenant isolation strategy should the wider platform use?

## Your chosen direction

Use a hybrid multi-tenancy architecture, choosing shared or stronger isolation according to domain and customer risk.

## Why this was chosen

Standard customers benefit from efficient shared infrastructure, while enterprise or sensitive workloads may require separate databases, schemas or product instances.

## Why it is a strong fit

- Balances cost and isolation
- Supports enterprise requirements
- Allows product-specific tenancy

## Tradeoffs and safeguards

Hybrid tenancy adds provisioning, migration and operational complexity and needs explicit placement rules.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

## Question 84 — Multi-tenancy architecture

This is important because you want:

- local businesses buying products
- future SaaS products
- multiple companies using your systems
- client portals
- subscriptions

We need to decide how organizations are isolated.

Options:

### A. Single-user system

Only individual accounts.

❌ Not suitable.

---

### B. Shared database, organization-based tenancy (recommended)

Example:

```text
PostgreSQL

Organizations

├── Khan Store
├── ABC Tailors
├── XYZ Restaurant

Users

Ali → Khan Store
Sara → ABC Tailors
```

Every business record has:

```text
organization_id
```

Example:

```text
Invoice

id:
INV-001

organization:
Khan Store

amount:
50000
```

---

### C. Separate database per customer

Example:

```text
Khan Store Database

ABC Tailors Database

XYZ Restaurant Database
```

Very isolated but expensive and harder to manage.

---

### D. Hybrid multi-tenancy

Start with B, but architecture allows important enterprise customers to move to isolated infrastructure later.

Example:

Normal customer:

```text
Shared Database
```

Enterprise customer:

```text
Dedicated Database
Dedicated Storage
Dedicated Environment
```

---

My recommendation:

**D — hybrid multi-tenancy.**

Because you can serve:

- small Pakistani businesses
- international SMBs
- enterprise customers

without redesigning later.

Do you want to lock **D — hybrid multi-tenancy architecture?**

#### Your response

> D

#### Explanation or resolution

Locked: **Question 84 = D — hybrid multi-tenancy architecture.**

This is a very important decision because it determines whether your platform can serve both small businesses and enterprise clients without a redesign.

Final architecture:

```text
Multi-Tenant Platform

Users
  |
  |
Organizations
  |
  |
Business Data
```

Every business/customer belongs to an organization:

```text
Organization

Khan Super Store

Users:
├── Owner
├── Manager
└── Cashier

Products:
├── POS
└── Inventory

Invoices:
├── INV-001
└── INV-002
```

---

## Default mode — shared multi-tenancy

For most customers:

```text
PostgreSQL

organizations

├── Khan Store
├── ABC Tailors
├── XYZ Restaurant

Data separated by:

organization_id
```

Example:

```text
Invoice Table

id
organization_id
amount


001
Khan Store
50000


002
ABC Tailors
30000
```

The application enforces isolation:

```text
User logs in

↓

Identify organization

↓

Every query filtered by organization_id

↓

Only authorized data returned
```

---

## Enterprise mode — dedicated isolation

For larger clients:

```text
Enterprise Customer

Dedicated:

├── Database
├── Storage
├── Environment
└── Backups
```

Useful for:

- large companies
- government clients
- regulated industries
- clients requiring strict data separation

---

## Important security requirements

Multi-tenancy is one of the highest-risk areas, so we include:

```text
Tenant Security

✓ Organization boundaries
✓ Permission checks
✓ Database query isolation
✓ Audit logging
✓ File access isolation
✓ API tenant validation
✓ Automated tenant-isolation tests
✓ No cross-tenant data leakage
```

---

## Future SaaS products

This also helps your future products:

Example:

```text
Retail POS SaaS

Organization:
Khan Store

Tenant:
khan-store

Users:
10

Plan:
Professional

Features:
Inventory ✓
Reports ✓
Multi-branch ✓
```

Another customer:

```text
ABC Restaurant

Tenant:
abc-restaurant

Plan:
Starter
```

Both use the same platform safely.

---

Final locked principle:

> **Build for SaaS multi-tenancy from day one, but keep the ability to provide dedicated enterprise environments later.**

This aligns with your goal:
- local Pakistani SMB customers now
- international SMB/enterprise customers later

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
