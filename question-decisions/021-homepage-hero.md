# Question 021 — Homepage hero

**Status:** Locked  
**Implementation:** Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

What should the homepage hero show?

## Your chosen direction

Show an interactive ecosystem of connected software interfaces rather than a generic abstract technology graphic.

## Why this was chosen

Visitors should immediately understand that Stack & Scale builds real operational software.

## Why it is a strong fit

- Communicates capability visually
- Connects products and services
- Creates a distinctive first impression

## Tradeoffs and safeguards

The hero must remain understandable and usable when animation is disabled or the device is low-powered.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 21 — What should the homepage hero actually show?

This is now a major design decision.

**A. Strong headline + animated product mockups**
Several real/demo software interfaces floating or transitioning around the hero.

**B. One flagship product experience**
The hero focuses on one impressive software interface, then other work appears below.

**C. Abstract 3D tech visual**
A high-end WebGL visual representing software, automation, data, etc.

**D. Interactive “software ecosystem” hero**
Multiple product interfaces—POS, mobile app, AI agent, dashboard—connected together as one visual system.

**E. Very minimal hero**
Large typography and subtle motion only, with work immediately underneath.

For your positioning, I recommend **D**, but implemented carefully.

Something like:

> **We build software businesses depend on.**
> Products, mobile experiences, AI automation and custom systems engineered for real operations.

Beside it, a polished interactive composition could show:

```text
POS dashboard
      ↘
       Business system
      ↗       ↓
Mobile app   Analytics
      ↘       ↓
        AI Agent
```

As the visitor moves or scrolls, different interfaces become prominent.

It communicates **“we actually build software”** before the visitor reads a list of services.

Would you choose **D**, or another option?

#### Your response

> D

#### Explanation or resolution

Locked: **Question 21 = D — interactive software ecosystem hero**.

That gives us a much more distinctive opening than a generic agency hero.

The idea is:

```text
POS / Retail Platform
        ↘
         Core business system
        ↗          ↓
Mobile App     Analytics
        ↘          ↓
          AI / Automation
```

The interfaces can animate in a restrained way as the user moves or scrolls, but the headline and CTA stay clear. We should keep this performant and accessible, with a reduced-motion fallback.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
