# Question 070 — Analytics platform

**Status:** Locked  
**Implementation:** Phase 1; advanced analysis later  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How deeply should behavior and business outcomes be measured?

## Your chosen direction

Implement a full analytics foundation with privacy controls and a defined event taxonomy.

## Why this was chosen

Traffic counts alone cannot explain which content produces qualified leads, proposals or customers.

## Why it is a strong fit

- Connects marketing to revenue
- Improves product decisions
- Supports controlled experimentation

## Tradeoffs and safeguards

Tracking must respect consent, minimization, retention and deletion requirements.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 70 — Analytics and user behavior tracking

Since we are building a commercial website, we need to understand:

- which products visitors view
- which pages convert
- where leads come from
- which demos are booked
- which case studies perform well

But because we locked privacy-first architecture, we need to choose carefully.

Options:

**A. Google Analytics only**
Easy, but less privacy-focused.

**B. Privacy-focused analytics**
Example:
- PostHog
- Matomo
- Plausible

**C. Product analytics + privacy controls**
Track:
- website behavior
- conversions
- funnels
- events
- feature usage
- CRM attribution

with consent/privacy controls.

**D. Full analytics platform**
Everything in C plus:
- session replay
- experimentation/A-B testing
- feature flags
- customer journey analytics

For your company, I recommend:

**C initially, with the architecture ready for D.**

Reason:

You need to know:

```text
Visitor
 ↓
Product page
 ↓
Demo request
 ↓
CRM lead
 ↓
Customer
```

That connection is valuable.

But we avoid creepy tracking.

Do you want to lock **C — privacy-focused product/business analytics, D-ready later?**

#### Your response

> yes D

#### Explanation or resolution

Locked: **Question 70 = D — full analytics platform with privacy controls.**

So we will design analytics as a serious business intelligence capability, not just page views.

The system will track the full customer journey:

```text
Visitor

↓

Landing page

↓

Product / Service page

↓

Demo request

↓

CRM Lead

↓

Quotation

↓

Customer

↓

Subscription / Project
```

This allows you to answer questions like:

- Which product pages generate the most leads?
- Which industries convert best?
- Which campaigns bring paying customers?
- Which case studies influence decisions?
- How long does a lead take to become a customer?
- Which services generate the highest revenue?

Architecture:

```text
Website Events
      ↓
Analytics Layer
      ↓
┌────────────────────┐
│                    │
▼                    ▼
Product Analytics    CRM Attribution

User behavior       Business outcome
```

Capabilities:

```text
Analytics Platform

✓ Page analytics
✓ Conversion funnels
✓ Demo booking tracking
✓ Lead source tracking
✓ Campaign attribution
✓ User journeys
✓ Session analysis where appropriate
✓ A/B testing capability
✓ Feature usage analytics
✓ Product adoption metrics
✓ Custom events
✓ Dashboards
```

But privacy remains a hard requirement:

```text
Privacy Controls

✓ Consent management
✓ Cookie controls
✓ Data minimization
✓ Anonymous analytics where possible
✓ User deletion support
✓ Retention policies
✓ No unnecessary tracking
```

The analytics layer should also connect with `staff.company.com`:

Example:

```text
Marketing Dashboard

Website visitors
↓
Product views
↓
Demo requests
↓
Qualified leads
↓
Customers
↓
Revenue
```

This turns marketing decisions into data-driven decisions.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
