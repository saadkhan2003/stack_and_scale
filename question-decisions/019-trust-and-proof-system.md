# Question 019 — Trust and proof system

**Status:** Locked  
**Implementation:** Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Which forms of proof should the platform support?

## Your chosen direction

Support testimonials, client logos, detailed case studies, contextual metrics, team credibility and live product demonstrations from the beginning.

## Why this was chosen

Trust must be demonstrated through verifiable work and outcomes rather than decorative claims.

## Why it is a strong fit

- Strengthens conversion
- Supports local and international credibility
- Creates reusable evidence across the site

## Tradeoffs and safeguards

Only approved, accurate and properly attributed proof may be published.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 19 — How should the website prove trust?

Since your long-term goal is to become known as a **highly trusted software provider**, we need to decide which proof elements the site should emphasize.

Which of these do you expect to have or want to build toward?

**A. Client testimonials**
Name, company, photo/logo, review.

**B. Client logos**
A “Trusted by” section.

**C. Detailed case studies**
Problem → solution → screenshots → results.

**D. Real numbers/metrics**
Examples: businesses served, transactions processed, uptime, projects completed.

**E. Video testimonials**

**F. Google/Facebook/other public reviews**

**G. Certifications / partnerships / awards**

**H. Team credibility**
Real engineers, profiles, experience, LinkedIn/GitHub.

**I. Live product demos**

For your website, I would eventually aim for **A + B + C + D + H + I** as the core trust system, and add E/F/G whenever you genuinely have them.

Which of these do you want the CMS and website architecture to support from the beginning?

#### Your response

> do

#### Explanation or resolution

Locked: **Question 19 = A + B + C + D + H + I**.

So from the beginning, the CMS and frontend should support client testimonials, client logos, detailed case studies, real business metrics, team credibility, and live product demos.

The key is that these should be **real proof**, not decorative sections. For example, metrics should be stored with context like “120+ businesses served” or “99.9% uptime,” not generic counters that mean nothing.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
