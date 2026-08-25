# Question 046 — Product provisioning

**Status:** Locked  
**Implementation:** Phase 2 and Phase 4  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

What should happen after a product purchase?

## Your chosen direction

Use tracked assisted provisioning as the baseline and automate provisioning for products that support it.

## Why this was chosen

Older or customer-installed products may require staff steps, while SaaS products can activate automatically after verified payment.

## Why it is a strong fit

- Works across varied products
- Enables faster activation
- Provides an auditable checklist

## Tradeoffs and safeguards

Automation must be idempotent and safe when payments or provider calls are retried.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

## Question 46 — What happens after a customer buys a product?

This becomes important because `account.company.com` will manage products that may actually live on completely different infrastructure.

Suppose Khan Store buys your POS.

Should activation work like:

**A. Fully manual**
Your staff receives payment → manually installs/configures everything → manually creates license.

**B. Semi-automated**
Payment/contract is confirmed → staff reviews → clicks **Provision Product** → the platform creates subscription/license/organization/product instance and sends onboarding instructions.

**C. Fully automated where supported**
Payment is confirmed → platform automatically provisions the customer's product environment through that product's API → creates license → sends account invite → customer can start onboarding.

Because some of your future products may use Firebase, AWS, Supabase, local desktop installations, or client infrastructure, I recommend:

> **B as the universal baseline + C for products that support automated provisioning.**

For example:

```text
Payment verified
      ↓
Subscription created
      ↓
Provisioning strategy?
      │
 ┌────┴──────────────┐
 │                   │
 ▼                   ▼
Manual/Semi       Automated
POS desktop       SaaS product
 │                   │
Staff installs     Product API
 │                   │
Register instance  Create tenant
 │                   │
 └─────────┬─────────┘
           ↓
account.company.com
shows product ACTIVE
```

This prevents us from forcing every product into the same deployment model.

**Question 46: Shall we lock B by default + C whenever a product supports it?**

#### Your response

> yes

#### Explanation or resolution

Locked: **Question 46 = B as the universal baseline + C wherever the product supports automated provisioning**.

That means the platform will treat provisioning as a capability of each product, not assume one setup method for everything.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
