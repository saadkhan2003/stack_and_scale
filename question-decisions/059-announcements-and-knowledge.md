# Question 059 — Announcements and knowledge

**Status:** Locked  
**Implementation:** Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should staff have internal announcements and a knowledge base?

## Your chosen direction

Provide structured internal announcements and a searchable, permission-aware knowledge base.

## Why this was chosen

Operational knowledge should remain accessible and current instead of living only in messages or individual memory.

## Why it is a strong fit

- Improves onboarding
- Reduces repeated questions
- Preserves company knowledge

## Tradeoffs and safeguards

Content needs ownership, review dates and archival so it does not become stale.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 59 — Do you want internal announcements and a company knowledge base?

Since `staff.company.com` is becoming your central workspace, I recommend adding two lightweight internal features:

**Internal announcements**
- company updates
- policy changes
- release notices
- maintenance notices
- important sales/support announcements

**Knowledge base**
- sales playbooks
- support SOPs
- onboarding guides
- product documentation
- pricing rules
- deployment procedures
- internal policies

I would keep this intentionally lightweight rather than trying to rebuild Notion.

My recommendation is:

> **Yes — internal announcements + structured knowledge base, with search and permissions.**

Do you want to lock that?

#### Your response

> yes

#### Explanation or resolution

Locked: **Question 59 = internal announcements + structured knowledge base with search and permissions**.

So `staff.company.com` will also become the internal operating hub for company knowledge, not just CRM and billing. It can include sales playbooks, support SOPs, onboarding guides, product documentation, policies, pricing rules, deployment procedures, release notes, internal announcements, and role-restricted documentation.

The key distinction remains: this is a **lightweight, structured internal knowledge system**, not an attempt to rebuild Notion.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
