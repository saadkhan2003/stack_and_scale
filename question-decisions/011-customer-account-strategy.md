# Question 011 — Customer account strategy

**Status:** Locked  
**Implementation:** Identity foundation in Phase 1; portals in Phase 3  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should visitors eventually have accounts?

## Your chosen direction

Support both a custom-development client portal and a separate product-customer account system, while keeping them separate from the public website and CMS identities.

## Why this was chosen

The two customer groups have different records, permissions and workflows and should not be forced into one generic account area.

## Why it is a strong fit

- Clear security boundaries
- Professional customer experience
- Supports both services and products

## Tradeoffs and safeguards

Portal scope can grow quickly; only the identity and boundaries belong in the earliest release.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 11 — Should visitors be able to create accounts?

For the public website, do you want it to remain a **company/marketing website only**, or do you expect customers eventually to log in?

Examples of customer login features could be:

**A. No customer accounts**
Visitors can browse products, projects, services, book demos, contact you, etc.

**B. Client portal later**
Customers can eventually log in to:
- see their projects
- invoices
- support tickets
- documents
- project progress
- subscriptions/licenses

**C. Product account system**
Customers who buy POS/tailor/etc. could log in through your main website to manage licenses, subscriptions, billing, downloads, branches, users, etc.

**D. Both B + C eventually**

For your V1, I recommend **A now, but architecture ready for D later**.

That keeps the first release focused and production-quality without turning your company website into a SaaS platform before you need it.

Which do you want: **A, B, C, or D?**

#### Your response

> i would prefre B and C options please

#### Explanation or resolution

Good — then we’ll plan for **both B + C**, but keep them separate from the public marketing site and from the CMS admin.

That gives us three distinct access layers:

- **CMS users** — you and staff members who manage website content.
- **Client portal users** — custom-development clients who can see project progress, documents, invoices, support, etc.
- **Product customers** — customers using your POS, tailor-management, or other software who may manage licenses, subscriptions, branches, billing, downloads, and support.

For V1, I would not build every portal feature immediately unless you need it now. But I **would architect authentication, database boundaries, routing, and permissions so B + C can be added cleanly without rebuilding the website**.

Conceptually:

```text
www.company.com
Public website

www.company.com/admin
Payload CMS
Staff only

portal.company.com
Custom-development client portal

account.company.com
Product/customer account area
```

Or we can keep them under one domain initially:

```text
/company
/products
/work

/client/*
/account/*
/admin/*
```

We’ll decide subdomains versus paths when we finalize infrastructure.

One important rule: **customer accounts should not simply be Payload CMS users**. CMS authentication is for your staff. Customer authentication should be its own application-level identity system with proper organizations, roles, sessions, auditability, and permissions.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
