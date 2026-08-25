# Question 030 — Product control plane

**Status:** Locked  
**Implementation:** Phase 3 and Phase 4  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should Stack & Scale products connect to account.company.com?

## Your chosen direction

Use account.company.com as the commercial control plane for products through secure APIs.

## Why this was chosen

A shared control plane can manage subscriptions, licenses, entitlements and product instances without rebuilding those capabilities for every product.

## Why it is a strong fit

- Unified product operations
- Reusable licensing
- Consistent customer account experience

## Tradeoffs and safeguards

The control plane must not become a runtime dependency for every transaction.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 30 — Should your own software products connect to `account.company.com`?

For example, suppose a customer has your POS installed. Should the POS itself communicate with your central platform so you can manage licenses and subscriptions?

I recommend **yes**.

Conceptually:

```text
Customer POS
     │
     │ secure API
     ▼
Your platform
     │
     ├── Is license active?
     ├── Which plan?
     ├── How many branches?
     ├── How many users?
     ├── Subscription expiry?
     └── Which features enabled?
```

Then `account.company.com` becomes the **central control plane for all your products**.

This could become extremely valuable as your software house grows.

Would you like that architecture?

#### Your response

> yes

#### Explanation or resolution

Locked: **Question 30 = Yes — `account.company.com` becomes the central control plane for your software products.**

That means your POS, tailor system, and future products can authenticate with your platform through secure APIs and ask things like:

```text
Is this customer's license active?
Which plan are they on?
Which features are enabled?
How many branches are allowed?
How many users are allowed?
When does the subscription expire?
Are any add-ons enabled?
```

This is a very strong long-term architecture because later you can manage all your products from one place rather than building a separate licensing system for every application.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
