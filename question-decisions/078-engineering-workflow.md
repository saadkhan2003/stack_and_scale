# Question 078 — Engineering workflow

**Status:** Locked  
**Implementation:** Phase 0 and Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How rigorous should repository and release governance be?

## Your chosen direction

Use an enterprise GitOps-style workflow with protected changes, automated checks, previews and controlled promotion.

## Why this was chosen

The platform includes several applications and sensitive workflows that need traceable, reproducible delivery.

## Why it is a strong fit

- Safer collaboration
- Auditable releases
- Consistent environment promotion

## Tradeoffs and safeguards

Process should be automated and risk-based rather than bureaucratic for every small change.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 78 — Repository and development workflow

Now we decide how professional the engineering workflow should be.

Since we locked:

- monorepo
- CI/CD
- production DevOps
- staging/production separation
- automated testing

we need the Git workflow.

Options:

### A. Simple Git workflow

```text
main branch

Everyone pushes directly
Deploy manually
```

Fast but not suitable for a serious product.

---

### B. Standard professional workflow

```text
main
 |
develop
 |
feature branches
```

Flow:

```text
Developer

feature/login
       ↓
Pull Request
       ↓
Review
       ↓
Tests
       ↓
Merge
       ↓
Deploy
```

---

### C. Trunk-based development

Small frequent changes:

```text
main

small branches

frequent merges

feature flags
```

Used by many high-performing engineering teams.

---

### D. Enterprise GitOps workflow

Everything in B/C plus:

- required reviews
- automated security scanning
- dependency checks
- release approvals
- changelog generation
- deployment promotion

Example:

```text
Code
 ↓
Pull Request
 ↓
CI checks
 ↓
Review
 ↓
Merge
 ↓
Staging
 ↓
Approval
 ↓
Production
```

For your goal, I recommend:

**D — enterprise GitOps-style workflow.**

Not because you need bureaucracy, but because your company is building systems customers depend on.

Do you want to lock **D — GitOps-style engineering workflow?**

#### Your response

> D

#### Explanation or resolution

Locked: **Question 78 = D — enterprise GitOps-style engineering workflow.**

This fits the level of software company you want to build.

The philosophy:

> Code changes should move through a controlled, tested, observable path — not directly from a developer laptop to production.

Final workflow:

```text
Developer

    ↓

Feature branch

    ↓

Pull Request

    ↓

Automated checks

├── Type checking
├── Linting
├── Unit tests
├── Integration tests
├── Security scanning
├── Dependency checks
└── Build verification

    ↓

Code Review

    ↓

Merge

    ↓

Staging deployment

    ↓

Testing / approval

    ↓

Production deployment
```

---

Repository strategy:

```text
company-platform/

apps/
├── website
├── staff
├── portal
└── account

packages/
├── company-ui
├── api-client
├── auth
├── email-system
├── validation
└── config

backend/
└── modular-monolith

cms/
└── Payload configuration

infra/
├── Docker
├── Terraform/OpenTofu
├── deployment configs
└── monitoring
```

---

CI/CD pipeline:

Example:

```text
Pull Request

✓ Install dependencies
✓ Validate environment
✓ TypeScript checks
✓ ESLint
✓ Unit tests
✓ Build applications
✓ Security scan
✓ Preview deployment

Merge to main

↓

Staging

↓

Production
```

---

Production safety:

We include:

```text
Production Protection

✓ Required approvals
✓ Deployment history
✓ Rollback capability
✓ Database migration checks
✓ Backup verification
✓ Health checks
✓ Monitoring alerts
```

---

Security automation:

Every change can automatically check:

- vulnerable dependencies
- exposed secrets
- insecure configurations
- outdated packages
- container vulnerabilities

---

This also helps your future software products because clients will trust that you operate professionally.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
