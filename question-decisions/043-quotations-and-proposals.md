# Question 043 — Quotations and proposals

**Status:** Locked  
**Implementation:** Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should proposals be produced inside the staff platform?

## Your chosen direction

Build structured quotations and proposals with PDF generation, versions and acceptance workflow.

## Why this was chosen

Sales information should flow directly into customer, contract, invoice and project records without duplicate entry.

## Why it is a strong fit

- Professional sales output
- Traceable revisions
- Smooth won-deal conversion

## Tradeoffs and safeguards

Document rendering, tax wording and approvals need rigorous templates and testing.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 43 — Should we build quotations/proposals inside `staff.company.com`?

Since your sales flow already includes **lead → demo → proposal/quote → negotiation → won**, I strongly recommend this.

A sales user could open a lead and create a quotation like:

```text
Quotation #QT-1042

Customer: Khan Super Store
Product: Retail POS

Setup & Implementation
Rs. XX,XXX

Subscription
Professional Plan
Rs. X,XXX / month

Add-ons
+ Extra branches
+ Custom reporting

Terms
Payment schedule
Support period
Validity date

[ Preview PDF ]
[ Send to Client ]
[ Mark Accepted ]
```

For custom software, it could be more detailed:

```text
Proposal

Project scope
Deliverables
Milestones
Timeline
Commercial terms
Payment milestones
Maintenance/support
Assumptions
Terms & conditions
```

And when accepted:

```text
Lead
  ↓
Proposal accepted
  ↓
Won
  ↓
Customer created
  ↓
Project / subscription created
  ↓
Invoice generated
```

I would also make quotation/proposal templates configurable so your staff does not recreate documents from scratch every time.

My recommendation is:

**Question 43 = built-in quotations + proposals + PDF generation + version history + acceptance workflow.**

Do you want to lock that?

#### Your response

> yes

#### Explanation or resolution

Locked: **Question 43 = built-in quotations + proposals + PDF generation + version history + acceptance workflow.**

So `staff.company.com` will be able to move a lead through:

`Lead → Demo → Quote/Proposal → Accepted → Customer → Project/Subscription → Invoice`

and preserve every proposal revision for audit/history.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
