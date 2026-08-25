# Question 044 — Contracts and signatures

**Status:** Locked  
**Implementation:** Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How should contracts and signatures work?

## Your chosen direction

Use managed contract templates and integrate an external electronic-signature provider.

## Why this was chosen

Stack & Scale needs control over contract content without rebuilding identity verification and signature compliance infrastructure.

## Why it is a strong fit

- Faster contracting
- Reusable approved clauses
- Reduced legal-technology burden

## Tradeoffs and safeguards

Provider choice, jurisdiction and evidentiary requirements require legal review.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 44 — Contracts and e-signatures

Since proposals may turn into real projects or subscriptions, do you want the platform to also handle contracts?

I recommend:

**A. Upload signed contracts only**
You prepare/sign them elsewhere, then store them in the portal.

**B. Generate contracts from templates**
Staff chooses a template, fills variables, generates PDF, sends it to the client.

**C. Full e-signature workflow**
Everything in B, plus client signs online, with signature timestamps, signer identity, signed PDF, and audit trail.

For your long-term platform, I recommend **C**, but we should integrate a proper e-signature provider rather than inventing legally sensitive signature infrastructure ourselves.

Do you want to lock **C — contract templates + external e-signature integration**?

#### Your response

> C

#### Explanation or resolution

Locked: **Question 44 = C — contract templates + external e-signature integration**.

So the platform should support:

`Proposal accepted → contract generated from template → sent for signature → client signs → signed copy stored → audit trail preserved → project/subscription activated`

We should **not build our own legal e-signature engine**. We can integrate a proper provider later and keep the contract system provider-agnostic.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
