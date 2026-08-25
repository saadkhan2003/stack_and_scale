# Question 013 — Payment methods

**Status:** Locked  
**Implementation:** Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Which payment methods should the local-first platform support?

## Your chosen direction

Support bank transfer, Easypaisa, JazzCash, Raast and staff-recorded cash initially, with a provider-neutral model ready for cards and international gateways.

## Why this was chosen

These methods fit Pakistani customers and can share one verification and allocation model.

## Why it is a strong fit

- Matches local payment behavior
- Avoids hard-coded payment logic
- Supports future international expansion

## Tradeoffs and safeguards

Manual methods require proof, reconciliation, fraud controls and authorized verification.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

## Question 13 — Payments

This is now important because you've chosen subscriptions.

For Pakistani customers, how should customers eventually be able to pay you?

Potential options are:

**A. Bank transfer**

**B. Easypaisa**

**C. JazzCash**

**D. Debit/credit card**

**E. Raast**

**F. Manual cash payment recorded by your staff**

**G. Online payment gateway**

And because you want to move internationally later, eventually:

**H. International card/subscription payments**

such as Stripe or another provider available to the legal entity you'll operate through.

My initial recommendation for local V1 would be to architect for **A + B + C + E + F**, while keeping a proper payment-provider abstraction so online card billing can be added later.

Tell me which payment methods you currently want to accept.

#### Your response

> ok...Payments
> This is now important because you've chosen subscriptions.
> For Pakistani customers, how should customers eventually be able to pay you?
> Potential options are:
> A. Bank transfer
> B. Easypaisa
> C. JazzCash
> D. Debit/credit card
> E. Raast
> F. Manual cash payment recorded by your staff
> G. Online payment gateway
> And because you want to move internationally later, eventually:
> H. International card/subscription payments
> such as Stripe or another provider available to the legal entity you'll operate through.
> My initial recommendation for local V1 would be to architect for A + B + C + E + F, while keeping a proper payment-provider abstraction so online card billing can be added later.....A + B + C + E + F is best

#### Explanation or resolution

Locked: **A + B + C + E + F** for the local-first version.

So the payment architecture should support:

- **Bank transfer**
- **Easypaisa**
- **JazzCash**
- **Raast**
- **Manual cash payment recorded by staff**

I would design the billing system so these are not hard-coded one-off cases. Internally, every payment should use a common structure such as:

```text
Payment
├── customer
├── organization
├── invoice
├── amount
├── currency
├── payment_method
├── transaction_reference
├── proof_of_payment
├── status
├── paid_at
├── verified_by
└── notes
```

Then `payment_method` can be:

```text
BANK_TRANSFER
EASYPAISA
JAZZCASH
RAAST
CASH
CARD
STRIPE
OTHER
```

Even if `CARD` and `STRIPE` aren't enabled initially.

That means when you expand internationally later, we won't redesign the whole billing database.

For manual/local payments, I also want a verification flow:

```text
Customer pays
      ↓
uploads receipt / transaction ID
      ↓
Payment = Pending
      ↓
your staff verifies it
      ↓
Payment = Verified
      ↓
invoice marked Paid
      ↓
subscription/license activated or renewed
```

For cash:

```text
Staff receives cash
      ↓
records payment
      ↓
receipt generated
      ↓
invoice updated
```

And later, automated gateways can use the same billing layer:

```text
Stripe / card gateway
      ↓
webhook
      ↓
payment automatically verified
      ↓
subscription renewed
```

So this decision is good for both **Pakistan now** and international growth later.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
