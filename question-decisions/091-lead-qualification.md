# Question 091 — Lead qualification

**Status:** Locked  
**Implementation:** Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should public forms be generic or intent-specific?

## Your chosen direction

Use structured forms tailored to product demos and custom-software inquiries, with future lead scoring and automation support.

## Why this was chosen

Different intents require different qualification data, and structured records improve sales follow-up.

## Why it is a strong fit

- Higher-quality leads
- Better routing and attribution
- Less manual clarification

## Tradeoffs and safeguards

Forms must remain short enough to avoid reducing conversion.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

## Question 91 — Public website lead capture and sales funnel

Now we need to define how visitors become customers.

Your website will have:

- Book Demo
- Contact
- Request Software
- Product inquiries
- Custom project requests

How should this flow work?

### A. Simple contact form

Visitor fills:

- name
- email
- message

↓

Email notification

---

### B. Structured lead qualification (recommended)

Different forms depending on intent:

Example:

Product demo:

```text
Business name
Industry
Number of employees
Branches
Current problems
Interested product
Preferred contact
```

Custom software:

```text
Company
Project idea
Budget range
Timeline
Requirements
Technology needs
```

Then:

```text
Website

↓

Lead Created

↓

CRM

↓

Lead Score

↓

Sales Follow-up
```

---

### C. Advanced sales automation

Everything in B plus:

- automated email sequences
- lead scoring AI
- CRM automation
- marketing campaigns

---

My recommendation:

**B now + architecture ready for C.**

Because your biggest goal initially is converting visitors into qualified leads, not collecting random messages.

Do you want to lock **B + C-ready sales funnel architecture?**

#### Your response

> B now + architecture ready for C.........also tell me how many questions remaining

#### Explanation or resolution

Locked: **Question 91 = B now + architecture ready for C — structured lead qualification and future sales automation.**

This is a good decision because your website should not just collect messages; it should create **qualified business opportunities**.

Final lead flow:

```text
Visitor

↓

Website

├── Book Demo
├── Product Inquiry
├── Custom Software Request
└── Contact

↓

Structured Form

↓

CRM Lead Created

↓

Lead Qualification

↓

Sales Pipeline

↓

Proposal / Demo

↓

Customer
```

Different audiences get different forms:

### Product customer

Example:

```text
Business Name
Industry
Number of branches
Current software
Problems
Interested product
Preferred contact method
```

---

### Custom software client

Example:

```text
Company
Project idea
Business goals
Required features
Timeline
Budget range
Technical requirements
```

---

CRM automatically stores:

```text
Lead

Source:
Website - POS Page

Interest:
Retail POS

Industry:
Retail

Status:
New

Assigned:
Sales Person

Next action:
Schedule demo
```

---

Future-ready for:

```text
Sales Automation

├── Email sequences
├── Lead scoring
├── Campaign tracking
├── Marketing automation
├── AI qualification (later)
└── Predictive insights
```

---

## About remaining questions

We are now at **Question 91**.

The main architecture decisions are almost complete.

I estimate around **8–10 questions remaining** before we stop interviewing and convert everything into the final blueprint.

Remaining areas:

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
