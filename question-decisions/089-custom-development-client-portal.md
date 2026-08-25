# Question 089 — Custom-development client portal

**Status:** Locked  
**Implementation:** Phase 3  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How complete should portal.company.com be?

## Your chosen direction

Build a professional client portal for progress, milestones, files, proposals, billing, support and client-visible activity.

## Why this was chosen

Clients need transparency and a premium experience without Stack & Scale building a complete collaboration suite immediately.

## Why it is a strong fit

- Improves client trust
- Reduces scattered updates
- Centralizes approved documents and status

## Tradeoffs and safeguards

Internal notes, cost data and engineering-only tasks must remain excluded.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 89 — Customer portal experience

Now let's decide `portal.company.com`.

This is for custom software clients, not product subscribers.

Example:

A company hires you to build a mobile app.

They need:

- project progress
- milestones
- documents
- invoices
- communication
- approvals

Options:

### A. Basic client dashboard

Only:

- project status
- files
- messages

---

### B. Professional client portal (recommended)

Includes:

```text
Client Portal

Dashboard

├── Projects
├── Milestones
├── Tasks visible to client
├── Documents
├── Proposals
├── Contracts
├── Invoices
├── Payments
├── Support tickets
├── Team communication
└── Activity timeline
```

---

### C. Full collaboration platform

Everything in B plus:

- live comments
- design reviews
- approvals
- feedback boards
- real-time collaboration

---

My recommendation:

**B initially + architecture ready for C later.**

Because your goal is to look like a serious development partner, not just send clients emails and screenshots.

Do you want to lock **B + C-ready client portal?**

#### Your response

> B

#### Explanation or resolution

Locked: **Question 89 = B — Professional client portal.**

We will **not build a full collaboration platform initially**. The goal is to give clients a premium, transparent experience without creating unnecessary complexity.

The client portal becomes the place where clients feel:

> "This company operates professionally and I always know what is happening with my project."

Final structure:

```text
portal.company.com

Dashboard

├── Overview
│   ├── Project status
│   ├── Upcoming milestones
│   ├── Recent activity
│   └── Important updates
│
├── Projects
│   ├── Active projects
│   ├── Milestones
│   ├── Timeline
│   └── Progress
│
├── Documents
│   ├── Requirements
│   ├── Designs
│   ├── Deliverables
│   ├── Contracts
│   └── Reports
│
├── Proposals
│   ├── Quotations
│   ├── Versions
│   └── Acceptance status
│
├── Billing
│   ├── Invoices
│   ├── Payments
│   └── Receipts
│
├── Support
│   ├── Tickets
│   ├── Replies
│   └── Status
│
└── Activity Timeline
```

---

Example client experience:

```text
ABC Company

Mobile App Development

Status:
████████░░ 80%

Current milestone:

✓ UI Design
✓ Backend API
✓ Flutter Development
→ Testing


Recent updates:

24 Aug
New build uploaded

23 Aug
Client requirements approved

22 Aug
Payment received
```

---

Permissions:

Clients should only see what is intended.

Example:

Client sees:

```text
✓ Approved designs
✓ Deliverables
✓ Invoices
✓ Milestones
✓ Client-visible tasks
```

Client does not see:

```text
✗ Internal developer tasks
✗ Internal notes
✗ Team discussions
✗ Cost calculations
✗ Internal documents
```

---

This connects with our previous decisions:

```text
Client Portal

        ↓

Identity System

        ↓

Authorization Layer

        ↓

Projects / Billing / Files / Support APIs
```

---

Later, if needed, we can extend to:

```text
Advanced Collaboration

+
Live comments
+
Design approvals
+
Feedback boards
+
Real-time collaboration
+
Client review workflows
```

without redesigning the portal.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
