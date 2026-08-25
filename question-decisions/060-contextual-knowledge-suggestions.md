# Question 060 — Contextual knowledge suggestions

**Status:** Locked  
**Implementation:** Phase 2; semantic enhancement later  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should knowledge connect to operational records?

## Your chosen direction

Relate knowledge to products, tickets, projects, customers and staff workflows and show contextual suggestions.

## Why this was chosen

Relevant guidance is most useful at the moment a user is handling a record or problem.

## Why it is a strong fit

- Faster support and delivery
- Encourages consistent processes
- Creates a future semantic-search foundation

## Tradeoffs and safeguards

Initial suggestions should use reliable relationships and rules before adding AI ranking.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 60 — Should the knowledge base connect to products, tickets, projects, and staff workflows?

I recommend **yes**.

For example, a support agent viewing a POS sync ticket could automatically see:

- “POS Sync Troubleshooting”
- “Offline Mode Recovery SOP”
- “License Refresh Procedure”

A salesperson viewing a POS lead could see:

- “POS Qualification Checklist”
- “Demo Script”
- “Common Objections”
- “Pricing Rules”

A developer viewing a project could see:

- “Production Deployment SOP”
- “Security Checklist”
- “Release Procedure”

That makes the knowledge base context-aware instead of becoming a pile of documents nobody opens.

**Question 60: lock contextual knowledge suggestions across CRM, support, projects, products, and staff workflows?**

#### Your response

> yes lock....how many more questions

#### Explanation or resolution

Locked: **Question 60 = contextual knowledge suggestions across CRM, support, projects, products, and staff workflows.**

We’ve already covered the **core business architecture very deeply**. I would not drag this to 100+ questions just for the sake of it.

I think we need about **12–15 more important questions** to finish the requirements properly. They should cover the remaining gaps: design system/branding, exact navigation and page structure, CMS content modeling, accessibility, performance targets, search implementation, analytics/tracking, contact/demo UX, mobile/PWA behavior, environments/secrets, database strategy, testing/release gates, and final MVP-vs-phase-2 boundaries.

After that, I can consolidate everything we locked into a **single production architecture/specification** with the final stack, subdomains, services, data boundaries, CMS structure, database model, auth model, DevOps architecture, security/compliance, folder/repo strategy, and phased build roadmap.

So roughly **Question 61 → Question 73/75**, then we stop questioning and turn it into the actual blueprint.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
