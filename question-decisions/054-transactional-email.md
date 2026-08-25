# Question 054 — Transactional email

**Status:** Locked  
**Implementation:** Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How should email delivery be implemented?

## Your chosen direction

Use a provider abstraction with a high-quality transactional provider initially and treat every email as a polished product surface.

## Why this was chosen

Business domains should not depend directly on one provider, and customers will judge confirmations, proposals and receipts as part of the product.

## Why it is a strong fit

- Provider portability
- Consistent branded communication
- Better deliverability operations

## Tradeoffs and safeguards

Abstraction should cover common needs without hiding provider-specific capabilities that genuinely add value.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 54 — Email provider

Since V1 uses email for notifications, demo confirmations, password resets, invoices, support updates, contract flows, and account security, we should choose how transactional email is handled.

I would not run your own mail server on Hetzner. Deliverability, reputation, spam handling, DKIM/SPF/DMARC, bounce processing, and complaint handling are better handled by a specialized provider.

Good options include:

**A. Resend** — very developer-friendly, excellent with React/Next.js.

**B. Postmark** — strong transactional-email reputation and deliverability.

**C. Amazon SES** — inexpensive at scale, but more setup/operations.

**D. Provider abstraction** — build one internal email service so we can start with one provider and switch later.

My recommendation is **D**, initially backed by **Resend or Postmark**.

Then our application calls something like:

```ts
emailService.send({
  template: "invoice-paid",
  recipient,
  data
})
```

rather than calling a specific vendor everywhere.

That gives us:

```text
Application
    ↓
Email Service
    ↓
Provider Adapter
    ├── Resend
    ├── Postmark
    └── SES later
```

Would you like to lock **Question 54 = provider-abstracted transactional email, with Resend/Postmark initially**?

#### Your response

> D.....the sending emails soudl e best ever emails .....

#### Explanation or resolution

Locked: **Question 54 = provider-abstracted transactional email**, and yes — I agree that the emails themselves should be **top-tier product emails**, not basic system notifications.

I would treat email as another part of your product UI. Postmark’s current 2026 guidance makes the same point: transactional email should be treated like a product interface rather than an afterthought.

So our email architecture becomes:

```text
Application events
      ↓
Notification service
      ↓
Email service
      ↓
Template renderer
      ↓
Provider adapter
      ├── Resend
      ├── Postmark
      └── SES if needed later
```

For the actual templates, I would use **React Email + TypeScript**. It lets us build reusable email components, preview them locally, generate email-friendly HTML/plain text, and maintain a consistent design system. Resend currently supports React Email directly and can also store/version templates.

The important part is that we do **not** create every email independently. We make a proper email design system:

```text
Email UI System

LogoHeader
EmailContainer
Heading
BodyText
InfoCard
StatusBadge
AmountBlock
PrimaryButton
SecondaryLink
Divider
Timeline
InvoiceTable
SecurityAlert
Footer
```

Then emails like these all share the same visual language:

```text
Welcome
Email verification
Password reset
New device login
2FA/security alert

Demo booked
Demo rescheduled
Lead follow-up

Quotation sent
Proposal accepted
Contract ready
Contract signed

Invoice created
Payment received
Payment verified
Payment overdue
Receipt

Subscription activated
Subscription renewal
Subscription expiring
Subscription expired

Project milestone completed
New project update
Release published

Support ticket created
Support reply
Ticket resolved

Staff invitation
Lead assigned
Task assigned
Incident alert
```

But each type can still have its own personality.

For example, an invoice/payment email should feel very precise:

```text
Payment confirmed

Rs. 45,000

Invoice
INV-2026-00148

Payment method
Bank Transfer

Retail POS Professional

[ View Receipt ]
```

A project milestone email can be more visual:

```text
Milestone completed

Mobile Application
────────────────────

✓ Requirements
✓ UI/UX
✓ Backend API
✓ Flutter Development
→ Quality Assurance

Overall progress
72%

[ View Project ]
```

And a security email should be deliberately plain and serious:

```text
New sign-in detected

Chrome on Linux
Islamabad, Pakistan
24 Aug 2026 · 3:14 PM

If this was you, no action is required.

[ Secure My Account ]
```

No decorative animation, no marketing copy.

We should also have **proper sender identities**, not one `noreply@` address for everything:

```text
accounts@company.com
billing@company.com
support@company.com
projects@company.com
security@company.com
notifications@company.com
```

with replies routed appropriately.

And we need proper mail-domain configuration:

```text
SPF
DKIM
DMARC
custom return path
bounce handling
complaint handling
domain reputation monitoring
```

Postmark specifically provides guidance around DKIM, domain reputation, bounces, and transactional deliverability, which is exactly the operational side we need to take seriously.

I also want **email preview/testing as part of CI**, so a developer can't accidentally break an invoice or password-reset email and push it straight to production. Templates should be tested across mobile and major clients; Postmark also maintains cross-client-tested transactional template patterns.

So Question 54 is fully locked as:

> **Provider-independent email infrastructure + React Email design system + branded, responsive transactional emails + plain-text alternatives + deliverability monitoring + event-driven sending + template testing/versioning.**

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
