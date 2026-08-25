# Question 073 — API and event style

**Status:** Locked  
**Implementation:** Phase 1 onward  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should the backend use REST, GraphQL, events, or a hybrid?

## Your chosen direction

Use REST for synchronous contracts plus domain events and webhooks, with an enterprise evolution path.

## Why this was chosen

REST is straightforward for portals and products, while events decouple cross-domain and external workflows.

## Why it is a strong fit

- Clear client contracts
- Reliable integration model
- Supports gradual decomposition

## Tradeoffs and safeguards

Event schemas, ordering, retries and ownership need explicit governance.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 73 — API style

Since we locked API-first architecture, we need to decide the API design approach.

Options:

### A. REST API only

Example:

```http
GET /api/v1/customers
POST /api/v1/invoices
GET /api/v1/licenses
```

Pros:
- simple
- widely understood
- excellent for integrations

---

### B. GraphQL

Example:

```graphql
query {
 customer {
   invoices
   projects
 }
}
```

Pros:
- flexible frontend queries

Cons:
- more complexity
- security/performance management becomes harder

---

### C. REST + event-driven architecture (recommended)

Use:

REST for normal operations:

```text
Create customer
Create invoice
Get subscription
Update project
```

Events for system communication:

```text
customer.created
invoice.paid
subscription.renewed
ticket.resolved
license.activated
```

This matches everything we already designed:

- notifications
- audit logs
- product integrations
- webhooks
- automation

---

### D. Full event-driven system

Everything becomes events.

I do not recommend this now.

---

My recommendation:

**C — REST API + event-driven architecture.**

This gives you enterprise-level patterns without unnecessary complexity.

Do you want to lock **C?**

#### Your response

> C but more and other best stretagy for future also

#### Explanation or resolution

Locked: **Question 73 = C — REST API + event-driven architecture**, but we will design it with a **future enterprise evolution path**.

Your concern is correct: we should not choose something that is only good for today. We need a strategy that can grow for 5–10 years.

So the final API/integration strategy becomes:

## Phase 1 — Modular API platform (now)

Core communication:

```text
Applications
    |
    ↓
REST API
    |
    ↓
Modular Backend
    |
    ↓
PostgreSQL
```

REST handles:

- CRUD operations
- user actions
- dashboards
- customer data
- invoices
- subscriptions
- projects
- support

Example:

```http
GET    /api/v1/customers
POST   /api/v1/leads
POST   /api/v1/invoices
GET    /api/v1/subscriptions/{id}
```

Why REST?

Because your future integrations may be:

- Flutter apps
- desktop POS
- mobile apps
- external partners
- client systems
- AI agents

REST is universally understood.

---

# Phase 2 — Domain events (already designed)

Important business events are emitted:

```text
Something happens

↓

Domain Event

↓

Multiple systems react
```

Example:

Customer pays invoice:

```text
Payment completed

        ↓

payment.completed

        ↓

├── Notification service
│      sends email

├── Subscription service
│      activates plan

├── Audit service
│      records action

└── Analytics service
       updates metrics
```

The billing module does not need to know all these things.

This prevents tightly connected code.

---

# Phase 3 — Message broker when scale requires it

Initially:

```text
Backend
 |
 Event Bus
 |
 Internal modules
```

Later:

```text
CRM Service
       |
       |
    Message Broker
       |
       |
Billing Service
Notification Service
Analytics Service
```

Possible technologies:

- RabbitMQ
- NATS
- Kafka (only when justified)

We do **not** introduce Kafka just because large companies use it.

---

# Phase 4 — Public integration platform

Eventually:

```text
developers.company.com

API Documentation

Authentication

API Keys

Webhooks

SDKs

Rate limits

Sandbox environment

Changelog
```

Partners can build integrations:

```text
Accounting Software
       |
       ↓
Your API

POS
       |
       ↓
Your API

ERP
       |
       ↓
Your API
```

---

# Phase 5 — AI-native architecture (future)

Because you mentioned AI agents, we should prepare for this.

Future:

```text
AI Agents

       |
       ↓

Company AI Platform

       |
       ├── CRM data
       ├── Support knowledge
       ├── Product data
       ├── Analytics
       └── Documents
```

Examples:

Sales AI:

> "Which leads are most likely to convert?"

Support AI:

> "Find similar POS problems and suggest solutions."

Business AI:

> "Generate monthly performance report."

But the AI layer accesses data through controlled APIs, not directly through databases.

---

# Phase 6 — API governance

From the beginning we should include:

```text
API Standards

✓ Versioning (/v1)
✓ OpenAPI documentation
✓ Authentication
✓ Rate limiting
✓ Request validation
✓ Error standards
✓ Pagination
✓ Filtering
✓ Audit logging
✓ Webhook signatures
✓ Idempotency
✓ Deprecation policy
```

Example:

Instead of:

```text
/api/customer
```

we use:

```text
/api/v1/customers
```

Then years later:

```text
/api/v2/customers
```

without breaking old apps.

---

# Final locked strategy:

```text
API Architecture

REST API
        +
Domain Events
        +
Webhooks
        +
Background Jobs
        +
Future Message Broker
        +
Public Developer Platform
        +
AI Integration Layer
```

This is the architecture pattern used by mature SaaS/product companies, but scaled appropriately for your current stage.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
