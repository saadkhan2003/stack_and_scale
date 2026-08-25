# Question 079 — Testing strategy

**Status:** Locked  
**Implementation:** Phase 0 onward  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How comprehensive should automated testing be?

## Your chosen direction

Use production-grade unit, integration, contract, browser, migration, accessibility, performance and security testing according to risk.

## Why this was chosen

Critical journeys span forms, CRM, payments, identities, portals and integrations and cannot be protected by unit tests alone.

## Why it is a strong fit

- Reduces regressions
- Protects tenant boundaries
- Supports confident releases

## Tradeoffs and safeguards

A large test suite must remain fast, deterministic and focused on meaningful behavior.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 79 — Testing strategy

Now we need to define how much testing discipline we want.

Because you will have:

- customer accounts
- billing
- subscriptions
- CRM
- permissions
- products
- APIs
- portals

testing is very important.

Options:

### A. Basic testing

- Unit tests for important functions only

---

### B. Professional testing

- Unit tests
- Integration tests
- API tests
- Critical user-flow tests

---

### C. Production-grade testing

Everything in B plus:

- End-to-end browser testing
- Visual regression testing
- Accessibility testing
- Performance testing
- Database migration testing
- Security testing
- Automated test environments

---

### D. Advanced quality engineering

Everything in C plus:

- chaos testing
- load testing regularly
- contract testing between services
- synthetic monitoring
- mutation testing

---

My recommendation:

**C — production-grade testing.**

Reason:

D is used by very large companies with dedicated QA/platform teams. For your stage, C gives excellent reliability without unnecessary complexity.

Example:

```text
Every Pull Request

✓ Unit tests
✓ API tests
✓ Playwright E2E
✓ Accessibility checks
✓ Build check
✓ Security scan
```

Would you like to lock **C — production-grade testing?**

#### Your response

> C

#### Explanation or resolution

Locked: **Question 79 = C — production-grade testing.**

This matches the company you want to become: reliable enough that businesses trust your software, without introducing unnecessary enterprise complexity too early.

Testing strategy:

```text
Quality Engineering

1. Unit Testing
   ├── Business logic
   ├── Calculations
   ├── Validation rules
   └── Utilities


2. Integration Testing
   ├── API endpoints
   ├── Database operations
   ├── Authentication flows
   └── External integrations


3. End-to-End Testing
   ├── User registration
   ├── Login
   ├── Demo booking
   ├── CRM workflow
   ├── Invoice/payment flows
   ├── Support tickets
   └── Product activation


4. Visual Testing
   ├── Important pages
   ├── Design consistency
   └── Component changes


5. Accessibility Testing
   ├── Keyboard navigation
   ├── Screen reader basics
   └── WCAG checks


6. Performance Testing
   ├── Core Web Vitals
   ├── API response times
   └── Load checks


7. Security Testing
   ├── Dependency scanning
   ├── Secret detection
   ├── Authentication checks
   └── Permission testing
```

Critical business flows get the highest coverage:

```text
Lead
 ↓
Demo
 ↓
Proposal
 ↓
Contract
 ↓
Invoice
 ↓
Payment
 ↓
Subscription
 ↓
Support
```

Because a broken button on a marketing page is annoying.

A broken payment/subscription/permission system damages trust.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
