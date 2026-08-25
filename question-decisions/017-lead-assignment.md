# Question 017 — Lead assignment

**Status:** Locked  
**Implementation:** Phase 1; automation in Phase 2 or later  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How should incoming leads be assigned?

## Your chosen direction

Begin with a shared lead pool and manual ownership, while supporting later rules-based routing.

## Why this was chosen

The early team needs flexibility; automated routing becomes useful after products, locations and staff responsibilities stabilize.

## Why it is a strong fit

- Simple initial operation
- Clear ownership
- No architectural rework for automation

## Tradeoffs and safeguards

Unassigned leads need alerts and service-level targets so the shared pool does not become a waiting room.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 17 — Who should handle incoming leads?

As the company grows, should leads initially work like this:

**A. Everything comes to you**
You personally receive and handle every lead.

**B. Shared sales inbox**
All authorized staff can see new leads and someone manually takes ownership.

**C. Automatic assignment**
For example:
- POS → Product Sales
- Custom Software → Business Development
- AI/Automation → AI team
- Flutter → Mobile team

**D. Hybrid**
Start with a shared lead pool, but allow manual assignment now and automatic routing later.

For your current stage, I strongly recommend **D**.

That means the CRM could show:

```text
NEW LEADS

Ali Traders
POS System
Lahore
Unassigned
[Assign]

ABC Pvt Ltd
Custom Software
Islamabad
Assigned: You

XYZ Store
Tailor Management
Peshawar
Assigned: Sales User 2
```

And later we can add rules without rebuilding the CRM.

**Would you choose D?**

#### Your response

> yes D

#### Explanation or resolution

Locked: **Question 17 = D — hybrid lead assignment**.

So V1 will have a **shared lead pool + manual assignment**, while the backend is designed so we can later add automatic routing by product, service, city, lead value, or sales team.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
