# Question 056 — Staff search

**Status:** Locked  
**Implementation:** Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How should staff find records and actions?

## Your chosen direction

Provide powerful permission-aware global search and a command palette.

## Why this was chosen

An operations platform spanning many modules becomes slow if users must navigate each module separately.

## Why it is a strong fit

- Faster operations
- Cross-module discovery
- Action shortcuts

## Tradeoffs and safeguards

Authorization must filter results before retrieval, not merely hide them after search.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 56 — Search inside the staff platform

Your public website already has `Ctrl/Cmd + K` search. I think `staff.company.com` needs something even more powerful.

Should staff be able to press `Ctrl+K` and search across:

- leads
- customers
- companies
- projects
- invoices
- payments
- subscriptions
- tickets
- demo bookings
- product instances
- quotations
- staff
- tasks

For example:

```text
Ctrl + K

Search: "Khan"

Customers
→ Khan Super Store

Invoices
→ INV-2026-0142 — Khan Super Store

Tickets
→ SUP-184 — POS sync problem

Projects
→ Khan Inventory Platform
```

I recommend **yes — global operational search + command palette**, with permission-aware results so a Finance user cannot discover records they are not authorized to see.

Should we lock **Question 56 = powerful permission-aware global search for `staff.company.com`**?

#### Your response

> yes

#### Explanation or resolution

Locked: **Question 56 = powerful permission-aware global operational search + command palette for `staff.company.com`.**

This should be much more capable than the public website search. Staff can find records quickly and execute safe actions from the same interface:

```text
Ctrl / Cmd + K

Search "Khan"

Customers
→ Khan Super Store

Leads
→ Khan Traders — POS Demo

Invoices
→ INV-2026-0142

Payments
→ PAY-2026-0088

Tickets
→ SUP-184 — POS Sync Issue

Projects
→ Khan Inventory Platform
```

Permissions are applied **before results are returned**, not merely hidden afterward. So Finance, Sales, Developers, Support, etc. only search information they're authorized to access.

We can eventually support commands too:

```text
+ Create Lead
+ Create Customer
+ Book Demo
+ New Invoice
+ New Ticket
+ Create Task
+ Open Today's Demos
+ Show Overdue Invoices
```

That will make `staff.company.com` feel like an actual operations product rather than an admin dashboard.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
