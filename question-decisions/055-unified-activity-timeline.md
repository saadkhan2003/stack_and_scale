# Question 055 — Unified activity timeline

**Status:** Locked  
**Implementation:** Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should communication and system activity appear together?

## Your chosen direction

Create a unified customer timeline for CRM events, emails, support, payments, proposals, demos, subscriptions and projects.

## Why this was chosen

Staff need one chronological view of the relationship rather than searching several modules.

## Why it is a strong fit

- Better customer context
- Faster handoffs
- Improved accountability

## Tradeoffs and safeguards

The timeline needs event standards and permission filtering to avoid leaking internal or sensitive activity.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

## Question 55 — Should outgoing communication history appear inside the CRM/customer record?

I strongly recommend **yes**.

For example, when staff opens a customer:

```text
Khan Super Store

Activity
────────────────────────────

24 Aug
Payment verified
Email: Payment confirmation sent

23 Aug
Quotation QT-1042 sent
Email delivered

22 Aug
Demo completed
Internal note added

21 Aug
Demo confirmation sent
Email delivered

20 Aug
Lead created from POS page
```

And the system should know:

```text
Queued
Sent
Delivered
Bounced
Failed
```

where the email provider gives us those events.

That gives Sales/Support/Finance one complete communication timeline rather than forcing them to search individual inboxes.

**I recommend locking Question 55 = unified customer/activity timeline including system emails, CRM events, support activity, payments, proposals, demos and project events.**

#### Your response

> yes

#### Explanation or resolution

Locked: **Question 55 = unified customer/activity timeline**.

That means each customer, lead, project, subscription, and support record can show one chronological history of meaningful events across the platform:

```text
Customer Timeline

24 Aug
Payment verified
Email delivered: Payment confirmation

23 Aug
Proposal v3 sent
Proposal opened

22 Aug
Demo completed
Internal sales note added

21 Aug
Demo scheduled
Email delivered: Demo confirmation

20 Aug
Lead created
Source: Retail POS page
```

The timeline can include:

- CRM stage changes
- demo bookings
- staff notes
- emails sent/delivered/failed
- quotations/proposals
- contracts/signatures
- invoices/payments
- subscription changes
- product provisioning
- support tickets/replies
- project milestones
- releases
- important account/security events

We should keep **audit logs and activity timelines separate**, though.

`Activity timeline` = human-friendly business history.

`Audit log` = security/compliance record with exact actor, action, timestamp, old/new values, IP/session context where appropriate.

That separation will keep the interface useful without weakening auditability.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
