# Question 080 — Environment strategy

**Status:** Locked  
**Implementation:** Phase 0 and Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Which environments and preview capabilities are needed?

## Your chosen direction

Use local, automated test, preview, staging and production environments with strong isolation.

## Why this was chosen

Reviewable previews improve product quality, while production-like staging reduces deployment surprises.

## Why it is a strong fit

- Better review workflow
- Safer releases
- Clear environment separation

## Tradeoffs and safeguards

Preview environments require cost, lifecycle and secret controls.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 80 — Environment strategy

Now we need to decide how many environments the platform has.

Options:

### A. Two environments

```text
Development
Production
```

Simple but risky.

---

### B. Three environments (recommended)

```text
Development

↓

Staging

↓

Production
```

Meaning:

**Development**
- local developer machines
- experimental work

**Staging**
- production-like testing
- QA
- client previews
- final approval

**Production**
- real customers

---

### C. More advanced environments

```text
Local

↓

Dev

↓

Preview per Pull Request

↓

Staging

↓

Production
```

This is common for mature teams.

---

For your architecture, I recommend:

**C — advanced environment strategy.**

Because you have:

- website
- portals
- CMS
- backend
- future products

Preview deployments are very useful.

Example:

Developer creates:

```text
Feature:
New POS landing page

↓

Pull Request

↓

Automatic Preview:

preview-branch.company.dev

↓

Review

↓

Staging

↓

Production
```

Would you like to lock **C — advanced environment strategy with preview deployments?**

#### Your response

> C

#### Explanation or resolution

Locked: **Question 80 = C — advanced environment strategy with preview deployments.**

This gives you a professional workflow similar to mature software companies while still being practical.

Final environment architecture:

```text
Developer Machine

(Local)

↓

Feature Branch

↓

Automatic Preview Environment

(preview.company.dev)

↓

Development Environment

↓

Staging Environment

(staging.company.com)

↓

Production Environment

(company.com)
```

### Purpose of each environment

#### Local

Used by developers:

```text
Developer laptop

├── Frontend
├── Backend
├── Database
├── CMS
└── Services
```

---

#### Preview deployments

Created automatically for every pull request:

Example:

```text
Feature:
New product page design

↓

GitHub PR

↓

preview-142.company.dev
```

Used for:

- design review
- testing
- client/team feedback
- catching issues before merge

---

#### Development

Internal integration environment:

Used for:

- connecting frontend/backend
- testing new features together
- developer testing

---

#### Staging

Almost identical to production:

Used for:

- QA testing
- final approval
- CMS content verification
- migration testing
- release validation

---

#### Production

Real users:

```text
www.company.com
staff.company.com
portal.company.com
account.company.com
api.company.com
```

---

Infrastructure flow:

```text
GitHub

↓

CI/CD Pipeline

↓

Build

↓

Tests

↓

Deploy Preview

↓

Deploy Staging

↓

Approval

↓

Deploy Production
```

---

Additional production practices locked:

```text
Environment Management

✓ Separate databases
✓ Separate secrets
✓ Separate API keys
✓ Separate storage buckets
✓ Separate monitoring
✓ Safe database migrations
✓ Rollback capability
✓ No production data in development
```

This also supports your privacy requirement because customer data never casually moves into testing environments.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
