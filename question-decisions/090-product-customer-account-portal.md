# Question 090 — Product-customer account portal

**Status:** Locked  
**Implementation:** Phase 3  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How complete should account.company.com be?

## Your chosen direction

Build a professional product-customer portal now and keep it ready for advanced SaaS control-plane capabilities later.

## Why this was chosen

Product buyers need subscriptions, invoices, licenses, users, branches, downloads and support in one place.

## Why it is a strong fit

- Improves product operations
- Enables customer self-service
- Creates a foundation for future SaaS products

## Tradeoffs and safeguards

Usage analytics, API keys, marketplace and advanced integrations should remain deferred until needed.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

## Question 90 — Product customer account portal

Now we need to separate this from `portal.company.com`.

Remember:

`portal.company.com` = custom development clients.

`account.company.com` = customers who buy your own products.

Example:

A shop owner buys your POS.

They need:

- subscription
- billing
- users
- product access
- license
- support

How deep should `account.company.com` be?

### A. Simple account area

- profile
- invoices
- subscription

---

### B. Product customer portal (recommended)

```text
account.company.com

Dashboard

├── My Products
├── Active subscriptions
├── Billing
├── Invoices
├── Payments
├── Users
├── Licenses
├── Product settings
├── Downloads
├── Support
└── Notifications
```

---

### C. Full SaaS customer platform

Everything in B plus:

- organization management
- usage analytics
- API keys
- integrations
- advanced settings
- marketplace

---

For your current and future product strategy:

I recommend:

**B now + architecture ready for C.**

Because POS/tailor/software products will need a professional customer experience, but we don't need to build a complete SaaS control plane immediately.

Do you want to lock **B — product customer portal + C-ready architecture?**

#### Your response

> B now + architecture ready for C.

#### Explanation or resolution

Locked: **Question 90 = B now + architecture ready for C — professional product customer portal.**

This keeps the product ecosystem professional without overbuilding too early.

The separation is now very clear:

```text
portal.company.com

=
Custom Development Clients

Examples:
- Mobile app clients
- Enterprise software projects
- Custom automation projects


account.company.com

=
Product Customers

Examples:
- POS customers
- Tailor Management customers
- Future SaaS customers
```

---

Final `account.company.com` architecture:

```text
account.company.com

Dashboard

├── My Products
│   ├── Active products
│   ├── Product status
│   └── Product access
│
├── Subscriptions
│   ├── Current plan
│   ├── Renewal date
│   ├── Upgrade/downgrade
│   └── Subscription history
│
├── Billing
│   ├── Invoices
│   ├── Payments
│   ├── Receipts
│   └── Payment methods
│
├── Organization
│   ├── Company profile
│   ├── Branches
│   ├── Users
│   └── Roles
│
├── Licenses
│   ├── Product licenses
│   ├── Activations
│   └── Devices/instances
│
├── Downloads
│   ├── Installers
│   ├── Updates
│   └── Documentation
│
├── Support
│   ├── Tickets
│   ├── History
│   └── Knowledge base
│
└── Notifications
```

---

Example:

A retail shop purchases your POS:

```text
Khan Super Store

Products:

✓ Retail POS Professional

Subscription:

Professional Plan
Rs 5,000/month

Renewal:
24 Sep 2026

Branches:
3

Users:
8

License:
Active

Support:
2 open tickets
```

---

The architecture stays ready for future SaaS features:

```text
Future C Features

├── Usage analytics
├── API keys
├── Integrations
├── Webhooks
├── Advanced organization settings
├── Marketplace
├── Add-ons
├── Feature management
└── Developer access
```

---

Important connection:

```text
Customer Purchase

↓

Billing System

↓

Subscription Created

↓

Product Provisioning

↓

License Generated

↓

account.company.com

↓

Customer manages product
```

---

This also matches our earlier decisions:

✅ Product platform architecture
✅ Hybrid multi-tenancy
✅ Subscription billing
✅ Product provisioning
✅ Identity system
✅ API-first architecture

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
