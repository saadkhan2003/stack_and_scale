# Question 029 — Portal data boundaries

**Status:** Locked  
**Implementation:** Policy in Phase 1; portal implementation in Phase 3  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

What information may client and product portals contain?

## Your chosen direction

Store normal project, document, invoice, support, subscription, license, branch and user information; keep secrets and unusually sensitive datasets in dedicated secure systems.

## Why this was chosen

The portals need useful business context without becoming an unsafe dumping ground for credentials or production database exports.

## Why it is a strong fit

- Clear data classification
- Safer file handling
- Appropriate portal usefulness

## Tradeoffs and safeguards

Some projects may need controlled sensitive-data exchange, which requires a separately designed workflow.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 29 — What kind of data will the portals contain?

This affects security, backups, permissions, encryption, compliance, and database design.

For `portal.company.com`, do you expect clients to upload or access things such as:

**A. Basic project information only** — milestones, status, comments.

**B. Business documents** — requirements, contracts, quotations, invoices, reports.

**C. Source-code/repository-related information** — deployment links, releases, API credentials references, technical documentation.

**D. Sensitive business files** — financial data, customer exports, databases, private datasets.

**E. Support material** — screenshots, logs, bug reports, attachments.

For `account.company.com`, potentially:

**F. Billing/invoice/payment information**
**G. POS/customer subscription information**
**H. Branches, employees and permissions**
**I. Product usage/license information**

My recommendation is to design the security model assuming **B + C + E + F + G + H + I from the beginning**, while **not encouraging D unless genuinely required**. If clients eventually need to exchange highly sensitive datasets, we should give that a more controlled storage and access workflow rather than treating it like an ordinary attachment.

Which of these do you expect your platform to handle?

#### Your response

> i m not undesyanding it...plaze suggest me

#### Explanation or resolution

What I meant is: before we design `portal.company.com` and `account.company.com`, we should decide **what information those systems will be responsible for storing**.

For your case, I recommend keeping it practical and secure.

For `portal.company.com` — your **custom software clients** — I would support project progress, milestones, deadlines, project updates, requirements/documents, quotations, invoices, contracts, deliverables, screenshots, bug reports, support tickets, release notes, meeting notes, and downloadable project files.

So a client might see something like:

```text
portal.company.com

ABC Company
Custom Inventory Platform

Project Progress: 72%

Milestones
✓ Requirements
✓ UI/UX
✓ Backend
→ Mobile Application
○ Deployment

Latest Updates
Files
Invoices
Support
Team
Releases
```

This becomes a professional client workspace instead of managing everything through WhatsApp and random email attachments.

For technical information, we can also show things such as GitHub repository links, staging URLs, production URLs, deployment status, API documentation links, and software versions.

But I would **not store passwords, production API secrets, SSH keys, database passwords, private keys, etc. directly inside the client portal**. Those belong in a proper secrets-management system.

For `account.company.com` — customers who buy your own products such as POS or Tailor Management — I would support company/business profile, purchased products, active subscription, plan, licenses, branches, users/employees, roles and permissions, invoices, payment history, payment proof uploads, renewal date, add-ons, downloads, support tickets, and usage information.

For example:

```text
account.company.com

Khan Super Store

Products
└── Retail POS
    ├── Professional Plan
    ├── Active
    ├── 3 branches
    ├── 8 users
    └── Renewal: 15 Sep 2026

Billing
Licenses
Branches
Users
Support
Downloads
```

This is the architecture I recommend.

The one category I **would not support by default** is clients dumping very sensitive datasets into the portal—for example entire customer databases, banking information, medical records, or confidential production database dumps. If you later have a project that genuinely requires that, we design a separate secure transfer/storage process.

So **Question 29 can be locked as:**

**Client portal:** project information + documents + invoices + files + releases + support + technical links.

**Product account portal:** subscriptions + licenses + branches + users + billing + payments + downloads + support.

**Highly sensitive credentials/data:** separate secure systems, not ordinary portal content.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
