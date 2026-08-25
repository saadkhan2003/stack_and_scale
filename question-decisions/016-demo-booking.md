# Question 016 — Demo booking

**Status:** Locked  
**Implementation:** Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should demos be request-only, instantly scheduled, or hybrid?

## Your chosen direction

Use a hybrid flow: visitors can select an available slot or request another time.

## Why this was chosen

Immediate scheduling helps ready buyers, while a request option accommodates local preferences and unavailable time slots.

## Why it is a strong fit

- Reduces scheduling friction
- Captures more prospects
- Integrates naturally with the CRM

## Tradeoffs and safeguards

Calendar availability and time zones must be synchronized reliably.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 16 — Demo booking

When someone clicks **Book a Demo**, what should happen?

**A. Request-only**
They submit details, and your team contacts them to arrange a time.

**B. Pick a time directly**
They see available slots and book a demo immediately from the website.

**C. Hybrid**
They can either:
- choose an available time, or
- submit a request if none of the slots work.

For your local-first setup, I recommend **C**.

That gives serious customers instant scheduling, but doesn't block people who prefer WhatsApp or want a custom time.

Do you want **A, B, or C?**

#### Your response

> C

#### Explanation or resolution

Locked: **Question 16 = C — hybrid demo booking**.

So the demo flow should support both:

```text
Book a Demo
   ↓
Choose Product / Service
   ↓
Enter basic business details
   ↓
Choose:
   ├── Available time slot
   └── Request another time
   ↓
Confirmation
   ↓
CRM lead created
   ↓
WhatsApp / email confirmation
```

Later we can connect this to your team calendars so already-booked times disappear automatically.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
