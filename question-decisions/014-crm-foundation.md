# Question 014 — CRM foundation

**Status:** Locked  
**Implementation:** Basic version in Phase 1; expansion in Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should leads only be emailed, stored internally, or placed in an integration-ready CRM?

## Your chosen direction

Build a lightweight CRM now with clean integration and migration boundaries for larger CRM platforms later.

## Why this was chosen

Email alone cannot manage ownership, follow-up, pipeline state or attribution.

## Why it is a strong fit

- Creates a sales source of truth
- Prevents lost follow-ups
- Allows future external CRM integration

## Tradeoffs and safeguards

The internal CRM should remain focused and not attempt to copy every enterprise CRM feature.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 14 — Leads and CRM

When someone clicks:

**Book a Demo**
**Discuss Your Project**
**Get a Quote**

what should happen to that lead?

I strongly recommend that we **do not just send an email**.

The website should have a lightweight lead system where you can see:

```text
New
Contacted
Demo Scheduled
Demo Completed
Proposal Sent
Negotiation
Won
Lost
```

And every lead could contain:

```text
Name
Company
Phone / WhatsApp
Email
City
Interested product/service
Budget
Business type
Lead source
Notes
Assigned staff member
Status
Next follow-up date
```

Later this can connect to WhatsApp, email, automation, or a full CRM.

For V1, would you prefer:

**A. Simple form → email only**

**B. Built-in lightweight lead/CRM system**

**C. Integrate an external CRM later, but start with B**

For your company, I recommend **C: build a lightweight lead system now, but keep it ready to integrate with something larger later.**

#### Your response

> C

#### Explanation or resolution

Locked: **C — build a lightweight CRM now, but architect it so we can integrate or migrate to a larger CRM later.**

So the website lead flow becomes:

```text
Website form
   ↓
Lead created
   ↓
CRM dashboard
   ↓
New
Contacted
Demo Scheduled
Demo Completed
Proposal Sent
Negotiation
Won / Lost
```

You and authorized staff will be able to assign leads, add notes, set follow-ups, and see where each potential customer is in the sales process.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
