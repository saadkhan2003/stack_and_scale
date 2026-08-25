# Question 092 — Configurable sales pipelines

**Status:** Locked  
**Implementation:** Basic in Phase 1; expanded in Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should all opportunities follow one fixed pipeline?

## Your chosen direction

Support configurable pipelines with separate product and service sales flows.

## Why this was chosen

A POS subscription and a custom software contract have materially different evaluation and closing steps.

## Why it is a strong fit

- Accurate sales tracking
- Better forecasting
- Supports future products and teams

## Tradeoffs and safeguards

Too many custom stages make reporting inconsistent; governance and shared definitions are required.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 92 — CRM sales pipeline design

Now we define how your sales team will actually manage opportunities.

Since your website will generate leads from:

- POS products
- Tailor Management
- Custom software projects
- AI/automation services
- Mobile apps

the CRM pipeline should not be a simple "New → Closed" system.

I recommend a configurable pipeline.

Example:

```text
Sales Pipeline

New Lead

↓

Lead Qualified

↓

Discovery Call

↓

Demo Scheduled

↓

Requirement Gathering

↓

Proposal Sent

↓

Negotiation

↓

Contract Sent

↓

Won / Customer

↓

Lost
```

---

But different business types may need different pipelines.

Example:

### Product sale pipeline

```text

New Inquiry

↓

Demo

↓

Trial / Evaluation

↓

Subscription Started

↓

Active Customer
```

---

### Custom software pipeline

```text

Lead

↓

Discovery

↓

Technical Assessment

↓

Proposal

↓

Contract

↓

Development Project
```

---

CRM should support:

```text
CRM

✓ Multiple pipelines
✓ Lead stages
✓ Lead assignment
✓ Tasks/follow-ups
✓ Notes
✓ Attachments
✓ Email history
✓ Activity timeline
✓ Deal value
✓ Probability
✓ Expected revenue
✓ Source tracking
✓ Lost reason
✓ Conversion analytics
```

---

Example dashboard:

```text

Pipeline Value

New Leads        45
Qualified        18
Proposals        7
Negotiation      3
Won              12

Expected Revenue:
Rs 4,500,000
```

---

My recommendation:

**Question 92 = configurable CRM pipelines with separate product/service sales flows.**

This prevents your CRM from becoming limited when you grow.

Do you want to lock **Question 92 = configurable CRM pipelines?**

#### Your response

> configurable CRM pipelines with separate product/service sales flows...okay

#### Explanation or resolution

Locked: **Question 92 = configurable CRM pipelines with separate product/service sales flows.**

This means your CRM will not force every business opportunity into one sales process.

Final CRM direction:

```text
CRM System

Pipelines

├── Product Sales Pipeline
│
│   New Inquiry
│        ↓
│   Demo Scheduled
│        ↓
│   Evaluation
│        ↓
│   Subscription Started
│        ↓
│   Active Customer
│
│
├── Custom Software Pipeline
│
│   New Lead
│        ↓
│   Discovery
│        ↓
│   Requirement Analysis
│        ↓
│   Proposal
│        ↓
│   Negotiation
│        ↓
│   Contract
│        ↓
│   Project Created
│
│
└── Service Pipeline
    │
    ├── AI Automation
    ├── Flutter Development
    ├── Data Projects
    └── Consulting
```

CRM capabilities:

```text
Lead Management

✓ Multiple pipelines
✓ Custom stages
✓ Lead assignment
✓ Deal value
✓ Revenue forecasting
✓ Follow-up tasks
✓ Notes
✓ Attachments
✓ Communication history
✓ Source tracking
✓ Conversion analytics
✓ Lost reasons
✓ Activity timeline
```

---

Important addition:

The CRM should connect with everything else:

```text
Website

↓

Lead

↓

CRM

↓

Demo

↓

Proposal

↓

Contract

↓

Invoice

↓

Customer

↓

Project / Subscription
```

No manual duplicate data entry.

Example:

Sales closes a POS customer:

```text
CRM Deal

Won

↓

Customer Created

↓

Subscription Created

↓

Invoice Generated

↓

Account Portal Activated
```

---

This also supports future growth:

Today:

- Pakistani local businesses

Later:

- international software clients
- enterprise contracts
- SaaS customers

without changing the CRM.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
