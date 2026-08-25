# Question 010 — Website language

**Status:** Locked  
**Implementation:** Phase 1; additional languages later  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Which languages should version one support?

## Your chosen direction

Publish in English initially while keeping content models and routing localization-ready.

## Why this was chosen

English supports both professional Pakistani buyers and international expansion while avoiding duplicated content work at launch.

## Why it is a strong fit

- Higher initial content quality
- Lower editorial overhead
- Future localization remains possible

## Tradeoffs and safeguards

Some local audiences may prefer Urdu; add it only when there is enough content and operational capacity.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 10 — Languages

For V1, should the website be:

**A. English only**
Best if you want a premium, future-ready image and eventual international expansion.

**B. English + Urdu**
Useful for local Pakistani customers, but doubles content-management work.

**C. English first, but architecture ready for Urdu later**
This is what I recommend.

We can build the CMS and routing so later you can add:

`/en/products/pos`
`/ur/products/pos`

without rebuilding the site.

For your current plan, I’d choose **C**.

#### Your response

> only english

#### Explanation or resolution

Locked: **English only** for V1.

That keeps content quality high, avoids duplicated CMS work, and fits both your current Pakistani business audience and your future international direction.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
