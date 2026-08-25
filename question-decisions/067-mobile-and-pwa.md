# Question 067 — Mobile and PWA

**Status:** Locked  
**Implementation:** Phase 1; selective additions later  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How should the mobile experience be treated?

## Your chosen direction

Build mobile-first and add PWA capabilities selectively where they provide genuine value.

## Why this was chosen

Many local users will arrive on mobile, while installability and offline assets are useful only for specific workflows.

## Why it is a strong fit

- Excellent mobile usability
- Avoids unnecessary PWA complexity
- Allows later installable experiences

## Tradeoffs and safeguards

PWA caching must not expose stale authenticated or financial information.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 67 — Mobile experience

A large portion of your future customers will discover you through phones, especially local business owners.

How should mobile behave?

**A. Responsive website only**
Desktop design adapted to mobile.

**B. Mobile-first design**
Design the entire experience starting from phones, then expand to desktop.

**C. Progressive Web App (PWA)**
Installable website with offline capabilities, app-like experience.

**D. Mobile-first + selective PWA features**
Excellent mobile UX now, with PWA capabilities where useful later.

My recommendation:

**D.**

Reason:

- Your marketing site does not need to be an app.
- But future customer portals, dashboards, and product accounts can benefit from app-like behavior.
- Local customers may appreciate quick access from their phones.

Example:

```text
Customer opens:

account.company.com

↓
"Install App"

↓
Home screen icon

↓
Fast access to:
- invoices
- subscription
- support
- notifications
```

Do you want to lock **D — mobile-first + selective PWA architecture**?

#### Your response

> D

#### Explanation or resolution

Locked: **Question 67 = D — mobile-first + selective PWA architecture.**

This means:

- The public website is designed **mobile-first**, not desktop squeezed into a phone.
- Customer/staff portals can later gain app-like capabilities where useful.
- We do not turn the marketing website into an unnecessary mobile app.

Architecture:

```text
Public Website
www.company.com

✓ Mobile-first
✓ Responsive
✓ Fast loading
✓ Installable option later if valuable


Customer Portal
account.company.com

✓ PWA-ready
✓ Offline-friendly where appropriate
✓ Push notifications possible later


Staff Portal
staff.company.com

✓ Mobile responsive
✓ Field/sales/support friendly
✓ App-like experience possible
```

Important for your local market:

A shop owner should be able to:

- check subscription
- view invoices
- request support
- receive updates

comfortably from a phone.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
