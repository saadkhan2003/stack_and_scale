# Question 038 — Support system

**Status:** Locked  
**Implementation:** Phase 2; customer access in Phase 3  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How complete should customer support be initially?

## Your chosen direction

Build a professional ticket and support foundation now, with architecture ready for richer omnichannel support later.

## Why this was chosen

Products and custom projects need trackable support history, ownership and service status.

## Why it is a strong fit

- Improves accountability
- Connects support to customers and products
- Enables later service analytics

## Tradeoffs and safeguards

Omnichannel inboxes and complex SLAs should wait until volume justifies them.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 38 — Support system

Since both `portal.company.com` and `account.company.com` will have support, how deep should the support system go?

**A. Basic tickets**
Customer creates ticket → staff replies → resolved.

**B. Proper support desk**
Tickets, priorities, categories, attachments, assigned agent, statuses, internal notes, SLA tracking, customer history.

**C. Full omnichannel support later**
Everything in B, plus WhatsApp, email, website chat, and possibly product-generated support events feeding into one support inbox.

For your long-term architecture, I recommend **B now + C-ready later**.

That means a ticket could look like:

```text
Ticket #SUP-1042

Customer: Khan Super Store
Product: Retail POS
Branch: Blue Area
Priority: High
Category: Sync Issue
Status: In Progress
Assigned: Support User 3

Attachments
Activity
Internal Notes
Customer Replies
Related Product Instance
```

Would you like to lock **B now + C-ready later**?

#### Your response

> yes

#### Explanation or resolution

Locked: **Question 38 = B now + C-ready later**.

So V1 gets a proper support desk with ticket priorities, categories, attachments, assignment, statuses, internal notes, SLA fields, customer history, and links to the relevant product/project. Later we can unify WhatsApp, email, chat, and product-generated alerts into the same support inbox.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
