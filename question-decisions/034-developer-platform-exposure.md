# Question 034 — Developer platform exposure

**Status:** Locked  
**Implementation:** Private access in Phase 4; public platform later  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should the API be internal, partner-only, or public?

## Your chosen direction

Offer private partner access initially and keep the architecture ready for a public developer platform later.

## Why this was chosen

Controlled access meets real integration needs without prematurely committing to public support, SDK and sandbox obligations.

## Why it is a strong fit

- Enables valuable integrations
- Limits early support burden
- Keeps a commercial developer ecosystem possible

## Tradeoffs and safeguards

Partner APIs still require documentation, security, quotas and lifecycle policies.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 34 — Should the website itself have a public developer/API section?

Since we're designing an API-first platform, there are two different things:

**A. Internal API only**
Your own POS/apps/products use `api.company.com`, but customers never see developer documentation.

**B. Private partner API**
Selected business customers/integration partners can receive API credentials and documentation.

**C. Public developer platform eventually**
You could eventually have:

```text
developers.company.com

Documentation
API reference
SDK examples
Webhooks
Authentication
Sandbox
Changelog
API status
```

This would allow other companies to integrate their systems with yours.

My recommendation is:

**B initially + architecture ready for C later.**

For example, a large retailer might eventually ask:

> “Can your POS send sales data to our accounting software?”

Instead of writing one-off integrations forever, you could provide a controlled API/webhook system.

Do you want to lock **B now, C-ready later**?

#### Your response

> yes...but hown will the data send like it is not central db ...but it else other place where my pos db will have present/.

#### Explanation or resolution

Yes — **Question 34 is locked: private partner API initially, architecture ready for a public developer platform later.**

And your question about the databases is exactly the right one. **The databases do not need to be central for data to move between systems.** We connect applications through APIs/events, not by making all of them share one database.

Suppose your POS has its own architecture:

```text
Customer's POS
     │
     ├── Local SQLite database
     │       sales
     │       products
     │       inventory
     │
     └── POS Backend
             │
             ▼
       POS PostgreSQL
       somewhere else
       (Hetzner/AWS/etc.)
```

Your company platform remains separate:

```text
account.company.com
        │
        ▼
api.company.com
        │
        ▼
Central Platform DB
        │
        ├── customer
        ├── organization
        ├── subscription
        ├── license
        ├── invoice
        └── entitlement
```

The two systems **talk through APIs**.

## Example 1 — your platform sends information TO the POS

Suppose a customer's payment is verified.

Your central system now knows:

```text
Khan Store
POS Professional
Subscription active
5 branches allowed
20 users allowed
Advanced analytics enabled
```

It can send that information in two ways.

### POS asks for it — pull

```text
POS Backend
    │
    │ "Give me my current entitlement"
    ▼
api.company.com
    │
    ▼
{
  license: active,
  branches: 5,
  users: 20,
  analytics: true
}
```

The POS stores what it needs in **its own database**.

No database sharing occurs.

---

### Your platform tells the POS — push

Your central system can send a webhook:

```text
Central Platform

subscription.updated
        │
        ▼
https://pos.example.com/webhooks/company
        │
        ▼
POS Backend
        │
        ▼
POS's own database updated
```

So:

```text
Platform DB
     ↓
Webhook
     ↓
POS API
     ↓
POS DB
```

not:

```text
Platform DB
     ↓
directly editing POS DB
```

That distinction is important.

---

# Example 2 — POS sends information back

Perhaps you want `account.company.com` to show:

> Last connected 3 minutes ago
> POS version 4.2.1
> 3 of 5 licensed branches active

The POS can periodically send a small status event:

```http
POST api.company.com/v1/product-instances/heartbeat
```

with something conceptually like:

```json
{
  "instanceId": "pos_ABC123",
  "version": "4.2.1",
  "activeBranches": 3,
  "lastSync": "2026-08-24T14:20:00+05:00"
}
```

Your central system stores **that summary**, not the POS's entire operational database.

So:

```text
POS Database
     │
     │ only selected information
     ▼
POS Backend
     │
     ▼
api.company.com
     │
     ▼
Central Platform
```

---

# Your POS sales DON'T have to come centrally

Let's say the POS has:

```text
2,500,000 sales
80,000 customers
150,000 products
millions of inventory movements
```

There may be absolutely no reason to copy all of that into `account.company.com`.

The central system can simply know:

```text
Organization: Khan Store
Product: Retail POS
Instance: pos_ABC123
Subscription: Active
Plan: Professional
Branches: 3
License: Valid
```

While the actual operational data remains:

```text
POS Database
├── sales
├── stock
├── customers
├── suppliers
├── expenses
├── employees
└── reports
```

That's a much cleaner architecture.

---

# But what if you DO need some POS data?

Then we integrate only what is needed.

For example, suppose later the account portal should show:

> Sales processed this month: Rs. 4.8M

There are several options.

### Option 1 — request on demand

```text
account.company.com
        │
        ▼
Central API
        │
        ▼
POS API
        │
        ▼
POS Database
```

POS returns:

```json
{
  "monthlySales": 4800000
}
```

Central platform doesn't permanently store it.

---

### Option 2 — send aggregates periodically

Every hour/day the POS sends:

```json
{
  "date": "2026-08-24",
  "transactions": 824,
  "grossSales": 480000,
  "branchesOnline": 3
}
```

Your central system stores only those analytics.

Again:

**not the full sales table.**

---

### Option 3 — event based

When something important happens:

```text
sale.completed
branch.created
user.added
license.activated
sync.failed
```

the product publishes an event.

Useful events can travel to other systems without sharing databases.

---

# What if the POS database is Firebase?

No problem.

```text
Flutter/Web POS
      ↓
Firebase
```

You can have:

```text
Firebase Function / POS backend
             │
             ▼
      api.company.com
```

The Firebase project remains independent.

---

# What if it is Supabase?

Same:

```text
POS App
   ↓
Supabase
   ↓
Edge Function / Backend
   ↓
api.company.com
```

---

# What if it's on AWS?

```text
POS
 ↓
AWS API
 ↓
AWS Database

      ↕ secure APIs

api.company.com
```

Still fine.

---

# What if it is only a desktop POS with SQLite?

This is particularly relevant for your offline-first decision.

You might have:

```text
SHOP COMPUTER

POS Desktop App
      │
      ▼
SQLite
```

Then the application itself contains a small **sync client**.

When internet exists:

```text
SQLite
   │
   ▼
Sync Engine
   │
   ▼
POS Cloud API
```

And separately:

```text
Sync Engine / POS Cloud API
        │
        ▼
api.company.com
```

The shop can continue operating locally while offline.

---

# Think of every product as having an Adapter

This is probably the easiest mental model.

Your company defines one standard:

```text
Company Platform API
```

Then each product implements an adapter:

```text
              api.company.com
                     │
        ┌────────────┼──────────────┐
        │            │              │
        ▼            ▼              ▼

   POS Adapter   Tailor Adapter   AI Adapter
        │            │              │
        ▼            ▼              ▼

 PostgreSQL       Firebase          AWS
 + SQLite         backend          services
```

The adapter translates between:

**your standard company API**

and:

**whatever architecture that product uses.**

---

# The central system needs identifiers

This is how we link everything without sharing databases.

For example:

```text
Central Platform

organization_id:
org_123

product_id:
prod_pos

product_instance_id:
inst_9842

external_reference:
khan-store-prod-123
```

And inside the POS:

```text
POS Database

organization_external_id:
org_123

instance_id:
inst_9842
```

Now both systems understand:

> `inst_9842` belongs to `org_123`.

But neither system has to know the other's database tables.

---

# Security becomes much better too

I **would not allow**:

```text
Central server
    ↓
direct PostgreSQL credentials
    ↓
every product's database
```

That becomes dangerous very quickly.

Instead:

```text
Product
   ↓
authenticated HTTPS API
   ↓
Platform
```

with mechanisms such as:

```text
OAuth/service credentials
API keys where appropriate
short-lived tokens
signed requests
mTLS for very sensitive service communication if needed
webhook signatures
timestamps/nonces
rate limits
IP controls where useful
audit logging
```

If one product is compromised, the attacker shouldn't automatically receive database credentials for every other product.

---

# And for partner integrations later

Let's say a customer's accounting company wants POS data.

They should **not receive database access either**.

Instead:

```text
Their Accounting System
          │
          ▼
 developers.company.com
          │
          ▼
     Partner API
          │
          ▼
      POS Adapter
          │
          ▼
      POS Database
```

You can expose only:

```text
GET /sales/summary
GET /inventory
GET /invoices
```

while completely hiding:

```text
internal tables
database passwords
other customers
private implementation
```

This is one of the main reasons we are choosing **API-first**.

---

## The rule I want us to establish

> **Databases own data. APIs share capabilities. Events communicate changes.**

Not:

> “Everything must live in one database.”

That means your architecture can comfortably handle:

```text
POS              → PostgreSQL + SQLite
Tailor system    → Firebase
Mobile SaaS      → Supabase
AI platform      → PostgreSQL + vector database
Client project   → client's AWS
Legacy software  → MySQL
```

while all of them can still optionally communicate with:

```text
api.company.com
```

That is exactly how I would design your software-house platform for long-term flexibility.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
