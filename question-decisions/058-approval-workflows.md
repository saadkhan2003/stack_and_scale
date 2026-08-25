# Question 058 — Approval workflows

**Status:** Locked  
**Implementation:** Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should sensitive actions require approvals?

## Your chosen direction

Support configurable approval workflows for important business actions.

## Why this was chosen

Payments, refunds, publishing, contracts and access changes may require separation of duties as the company grows.

## Why it is a strong fit

- Reduces costly mistakes
- Creates decision accountability
- Supports enterprise operations

## Tradeoffs and safeguards

Too many approvals slow work; thresholds and eligible actions must be carefully chosen.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 58 — Should `staff.company.com` support approvals?

Because your system will handle money, contracts, permissions, subscriptions, customer changes, refunds, and potentially large quotations, I recommend that sensitive actions can require approval.

For example:

```text
Sales user creates 20% discount
        ↓
Manager approval required
        ↓
Approved
        ↓
Quotation can be sent
```

Or:

```text
Finance user requests refund
        ↓
Owner / Finance Manager approves
        ↓
Refund processed
```

Possible approval-controlled actions:

- large discounts
- refunds
- credit notes
- deleting important records
- changing subscription pricing
- granting powerful permissions
- creating/revoking API credentials
- enterprise proposals above a threshold
- contract exceptions
- manually overriding a license
- writing off unpaid invoices

I would recommend **configurable approval workflows**, so you decide which operations need one approval, multiple approvals, or none.

For example:

```text
Under Rs. 20,000
→ no approval

Rs. 20,000–100,000
→ Sales Manager approval

Above Rs. 100,000
→ Owner approval
```

This becomes increasingly valuable as your staff grows.

**Question 58: should we lock configurable approval workflows for sensitive business actions?**

#### Your response

> yes

#### Explanation or resolution

Locked: **Question 58 = configurable approval workflows for sensitive business actions**.

So discounts, refunds, credit notes, permission changes, license overrides, high-value proposals, contract exceptions, API credentials, write-offs, and similar actions can require one or more approvals based on configurable rules.

Example:

```text
Discount < 10%
→ no approval

Discount 10–20%
→ Sales Manager approval

Discount > 20%
→ Owner approval
```

Every approval decision will also go into the audit log and activity timeline.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
