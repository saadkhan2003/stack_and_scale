# Question 039 — Notification channels

**Status:** Locked  
**Implementation:** Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Which channels and preferences should notifications support?

## Your chosen direction

Allow preferences per event, but limit V1 delivery to in-app and email.

## Why this was chosen

These channels cover core operational needs while avoiding premature SMS, push and messaging complexity.

## Why it is a strong fit

- User-controlled noise
- Simple initial delivery
- Extensible event model

## Tradeoffs and safeguards

Critical security, billing or contractual notices may need mandatory delivery rules.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 39 — Notifications

Now we need to decide how notifications should work across the whole platform.

For staff, clients, and product customers, should notifications support:

**A. In-app only**
Notification bell inside each portal.

**B. In-app + email**

**C. In-app + email + WhatsApp for selected events**

**D. Full notification preference system**
Each user can choose which events they receive and on which channel.

For example:

```text
Payment verified
→ In-app ✓
→ Email ✓
→ WhatsApp ✓

New support reply
→ In-app ✓
→ Email ✓
→ WhatsApp optional

Project milestone completed
→ In-app ✓
→ Email ✓

Marketing updates
→ Off by default
```

For your system, I recommend **D**, with only important channels enabled in V1.

Do you want to lock **D — notification preferences per event/channel**?

#### Your response

> D....but in appp and email only

#### Explanation or resolution

Locked: **Question 39 = notification preferences per event/channel, but V1 channels are only In-app + Email.**

So we are **not adding WhatsApp notifications into the notification engine for now**. WhatsApp remains part of sales/support communication where useful, but system notifications stay cleaner.

Example:

```text
Notification Preferences

New lead assigned
✓ In-app
✓ Email

Demo scheduled
✓ In-app
✓ Email

Payment received
✓ In-app
✓ Email

Support ticket reply
✓ In-app
✓ Email

Project milestone completed
✓ In-app
✓ Email

Subscription expiring
✓ In-app
✓ Email
```

A user can control these individually.

Internally, I would avoid writing:

```ts
sendEmail(...)
```

inside every feature.

Instead:

```text
Something happens
      ↓
Domain Event
      ↓
Notification Service
      ↓
┌───────────────┐
│               │
▼               ▼
In-app          Email
```

For example:

```text
payment.verified
subscription.expiring
ticket.assigned
ticket.replied
demo.scheduled
lead.assigned
project.milestone.completed
```

This means we could add another delivery channel years later without redesigning leads, billing, support, projects, etc.

We should also distinguish notifications by audience:

```text
staff.company.com
→ sales / finance / support / project notifications

portal.company.com
→ client project notifications

account.company.com
→ subscription / payment / product / support notifications

admin.company.com
→ CMS/system administration notifications
```

And the in-app notification center can support:

```text
Unread/read
Mark all as read
Deep links
Timestamp
Notification category
Priority
Archive
```

Email should use proper branded transactional templates rather than plain ugly system emails.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
