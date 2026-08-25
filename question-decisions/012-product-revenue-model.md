# Question 012 — Product revenue model

**Status:** Locked  
**Implementation:** Phase 2 and Phase 3  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How should Stack & Scale charge for software products?

## Your chosen direction

Support setup fees plus recurring subscriptions, tiered plans, and custom quotations for larger customers.

## Why this was chosen

This combination provides predictable revenue while preserving flexibility for onboarding effort, branches, users and enterprise requirements.

## Why it is a strong fit

- Creates recurring revenue
- Supports customer segmentation
- Handles both standard and complex deals

## Tradeoffs and safeguards

Subscriptions add billing, entitlement, renewal and support obligations.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 12 — How do you expect to charge for your software products?

This affects the database, customer portal, billing architecture, and even the product pages.

Which models do you expect to use?

**A. One-time purchase**
Example: customer pays Rs. 50,000 for POS installation.

**B. Monthly/yearly subscription**
Example: Rs. 3,000/month or Rs. 30,000/year.

**C. Setup fee + recurring subscription**
Example: Rs. 20,000 setup + Rs. 4,000/month.

**D. Different plans**
For example:

```text
Starter
Professional
Business
Enterprise
```

**E. Custom quotation depending on business size**

You can combine them. For the type of products you described, I would lean toward **C + D + E**: recurring revenue where possible, tiered plans, while larger businesses receive custom quotations.

#### Your response

> us ethis like subsdomaisn like archittecture also...How do you expect to charge for your software products?C+D+E is best

#### Explanation or resolution

Yes — I would use the **subdomain-based architecture**. It fits your long-term plan much better than putting everything under one Next.js app route tree.

So this is now locked:

```text
www.company.com
→ Public marketing website
→ Products
→ Services
→ Work / case studies
→ Blog
→ Careers
→ Contact / demo booking

admin.company.com
→ Payload CMS
→ You + invited staff only
→ Projects
→ Products
→ Services
→ Blog
→ Careers
→ Testimonials
→ Team
→ Site settings

portal.company.com
→ Custom-development client portal
→ Project status
→ Milestones
→ Files
→ Deliverables
→ Invoices
→ Support
→ Messages / updates

account.company.com
→ Product customer portal
→ Purchased products
→ Subscriptions
→ Licenses
→ Branches
→ Users
→ Billing
→ Downloads
→ Support
```

I prefer this over:

```text
company.com/admin
company.com/client
company.com/account
```

because these are eventually **different products with different security boundaries, release cycles, users, and responsibilities**.

For example, in the future you could deploy:

```text
www.company.com
Next.js marketing app

admin.company.com
Payload CMS

portal.company.com
Client portal application

account.company.com
Product/customer platform
```

independently.

That also means a deployment problem in the marketing website doesn't necessarily take down the customer account system.

---

## We should also separate authentication

I would **not use one giant users table for everyone**.

Conceptually:

```text
CMS identity
    ↓
You / employees / editors

Client identity
    ↓
Companies hiring you for custom projects

Product identity
    ↓
Businesses purchasing POS / Tailor / etc.
```

We may still eventually use one central authentication provider underneath, but authorization remains separated.

For example:

```text
user@example.com

Organization:
ABC Retail

Roles:
Owner
Manager
Cashier
Accountant
```

would belong to the product platform.

Whereas:

```text
client@example.com

Organization:
XYZ Corporation

Project:
Mobile Commerce Platform

Role:
Client Admin
```

belongs to the client portal.

And:

```text
editor@company.com

Role:
Content Editor
```

belongs to your internal system.

That separation will save us significant pain later.

---

# Billing decision: C + D + E

Also locked.

Your main product business model becomes:

### C — Setup fee + recurring subscription

Example:

```text
POS Professional

Setup
Rs. 25,000

Monthly
Rs. 4,500/month
```

The setup can include things such as:

- initial configuration
- database setup
- business onboarding
- receipt configuration
- hardware integration
- staff training
- importing initial stock

Then the recurring charge gives you predictable revenue.

---

### D — Tiered plans

I strongly recommend this.

For example:

```text
STARTER
Small shops
1 branch
2 users
Basic reports
Basic inventory
────────────────
Rs. X / month


PROFESSIONAL
Growing businesses
3 branches
More users
Advanced reports
Customer credit
Expenses
────────────────
Rs. XX / month


BUSINESS
Larger operation
10 branches
Advanced permissions
Analytics
Integrations
Priority support
────────────────
Rs. XXX / month


ENTERPRISE
Custom requirements
Unlimited/custom branches
API
Custom integrations
SLA
Dedicated support
────────────────
Contact Sales
```

The numbers are just placeholders for now.

The CMS should allow you to change those plans without touching code.

---

### E — Custom quotation

This becomes especially important for:

- large retailers
- multi-branch businesses
- franchises
- custom ERP work
- unusual integrations
- custom reports
- data migrations
- custom hardware
- large staff counts

Then the pricing page might show:

```text
Starter        Professional       Business        Enterprise

Rs. X          Rs. XX             Rs. XXX          Custom
/month         /month             /month           quotation
```

And Enterprise gets:

**Talk to Sales**

rather than a checkout button.

---

# This changes our backend architecture

We now know the customer account platform eventually needs concepts such as:

```text
Customer
│
├── Organization
│
├── Subscription
│
├── Product
│
├── Plan
│
├── Licenses
│
├── Branches
│
├── Users
│
├── Invoices
│
├── Payments
│
├── Add-ons
│
└── Support entitlement
```

And the billing model could look like:

```text
Organization
     │
     ├── Subscription
     │       │
     │       ├── Product
     │       ├── Plan
     │       ├── Billing cycle
     │       ├── Status
     │       └── Renewal date
     │
     ├── Add-ons
     ├── Branches
     └── Users
```

This is why we're asking these questions before writing the application.

---

# We should support add-ons too

I would design the architecture so later you could sell things like:

```text
Extra branch
+ Rs. X/month

Extra user
+ Rs. X/month

Cloud backup
+ Rs. X/month

WhatsApp integration
+ Rs. X/month

Advanced analytics
+ Rs. X/month

Accounting integration
+ Rs. X/month

Priority support
+ Rs. X/month
```

You don't have to offer these now.

But the product model should not assume:

```text
one customer = one fixed package forever
```

because that becomes limiting very quickly.

---

## Current architecture is becoming something like this

```text
                         INTERNET
                             │
             ┌───────────────┼────────────────┐
             │               │                │
             ▼               ▼                ▼

      www.company.com   portal.company.com   account.company.com
      Marketing         Development clients  Product customers
      Next.js           Next.js              Next.js

             │               │                │
             └───────────────┬┴────────────────┘
                             │
                       Backend services
                             │
              ┌──────────────┼───────────────┐
              │              │               │
              ▼              ▼               ▼
         PostgreSQL       Storage        Authentication
                             │
                             ▼
                    Cloudflare R2 / S3


                  admin.company.com
                         │
                     Payload
                         │
                  Website content
```

And we'll design it so services can be separated further when scale actually requires it rather than prematurely turning everything into microservices.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
