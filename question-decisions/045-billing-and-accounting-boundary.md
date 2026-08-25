# Question 045 — Billing and accounting boundary

**Status:** Locked  
**Implementation:** Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How much billing and accounting should the platform own?

## Your chosen direction

Build a strong billing system and keep it ready to integrate with dedicated accounting software.

## Why this was chosen

The platform must own invoices, payments, subscriptions and customer status, but should not become a full general ledger.

## Why it is a strong fit

- Consistent customer billing
- Supports local methods
- Preserves accounting-tool flexibility

## Tradeoffs and safeguards

Financial reconciliation and tax requirements still need disciplined operational processes.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 45 — Invoicing and accounting

Since you want subscriptions, setup fees, custom projects, quotations, payments, and reports, how much finance functionality should `staff.company.com` handle?

**A. Invoices only**
Create invoice, mark paid/unpaid, download PDF.

**B. Invoices + recurring billing records**
Setup fees, monthly/yearly subscriptions, renewal dates, overdue invoices, partial payments, receipts, credit notes.

**C. Full internal billing layer + accounting integrations**
Everything in B, plus taxes, discounts, refunds, payment allocations, revenue recognition fields, export to accounting software, and future integrations with systems like QuickBooks/Xero or a local accounting platform.

For your architecture, I recommend **C**, but I would **not try to build a full accounting ERP ourselves**. Your platform should own billing and payment operations, then integrate/export to dedicated accounting software when needed.

Do you want to lock **C — strong billing system, accounting-integration ready**?

#### Your response

> C

#### Explanation or resolution

Locked: **Question 45 = C — strong billing system, accounting-integration ready.**

So `staff.company.com` will own the commercial billing workflow—setup fees, recurring subscriptions, invoices, partial payments, receipts, overdue balances, discounts, refunds/credit notes, taxes where applicable, and payment allocation—but we **will not turn it into a full accounting ERP**. Later, financial data can sync/export to dedicated accounting software.

Conceptually:

```text
Quotation / Contract
        ↓
      Invoice
        ↓
      Payment
        ↓
   Payment allocation
        ↓
Subscription / Project
        ↓
Receipt + financial records
        ↓
Accounting integration
```

This also means one invoice could support things like:

```text
Invoice INV-2026-00142

POS Setup                         Rs XX,XXX
Professional Subscription         Rs X,XXX
Extra Branches                    Rs X,XXX
Custom Report                     Rs X,XXX
                                 ─────────
Subtotal                          Rs XX,XXX
Discount                          Rs X,XXX
Tax                               Rs X,XXX
                                 ─────────
Total                             Rs XX,XXX

Paid                              Rs XX,XXX
Remaining                         Rs X,XXX
```

And payment methods remain the ones we already chose: **bank transfer, Easypaisa, JazzCash, Raast, and manually recorded cash**, with future gateways fitting into the same payment abstraction.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
