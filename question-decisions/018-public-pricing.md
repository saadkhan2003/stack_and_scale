# Question 018 — Public pricing

**Status:** Locked  
**Implementation:** Phase 1 policy; reassess after product packaging matures  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should exact product pricing be displayed publicly?

## Your chosen direction

Do not publish exact pricing initially; use demo, quote and sales calls to price according to scope and customer context.

## Why this was chosen

Setup effort, branches, users, integrations and support can materially change product pricing.

## Why it is a strong fit

- Preserves commercial flexibility
- Supports tailored proposals
- Avoids misleading simple prices

## Tradeoffs and safeguards

Hidden pricing can reduce self-qualification and should be reviewed when plans become standardized.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 18 — Do you want the website to show pricing publicly?

This matters a lot for local product sales.

There are three good approaches:

**A. Full public pricing**
Show exact plans and prices for POS, tailor management, etc.

**B. “Starting from” pricing**
Show something like:

> POS starts from Rs. XX,XXX setup + Rs. X,XXX/month

but larger/custom plans still say **Contact Sales**.

**C. No public pricing**
Only show features and ask people to request a quote.

For your model of **setup fee + subscriptions + plan tiers + custom enterprise quotes**, I recommend **B**.

That gives local buyers enough clarity to qualify themselves, while keeping flexibility for larger deals.

Would you choose **B**?

#### Your response

> C

#### Explanation or resolution

Locked: **Question 18 = C — no public pricing**.

That means product pages will focus on value, features, screenshots, use cases, trust, and demos, then use CTAs like:

**Book a Demo**
**Get a Quote**
**Talk to Sales**

Pricing remains internal because it may depend on business size, branches, users, integrations, setup effort, and support level.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
