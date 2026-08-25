# Question 031 — Offline-first products

**Status:** Locked  
**Implementation:** Product-specific work in Phase 4  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should operational products continue working without internet access?

## Your chosen direction

Use offline-first architecture for products such as POS where continuous operation is essential.

## Why this was chosen

Internet outages should not stop sales, receipts or inventory work; changes can synchronize after connectivity returns.

## Why it is a strong fit

- Resilient customer operation
- Fits Pakistani connectivity realities
- Improves product trust

## Tradeoffs and safeguards

Synchronization, conflicts, device security and license grace periods add significant engineering work.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 31 — Should your products work offline?

This one is **very important for Pakistan**, especially for POS systems.

Imagine a shop's internet goes down for 6 hours. What should happen?

**A. Internet required**
The software stops working until connectivity returns.

**B. Limited offline mode**
Basic sales continue, but some cloud features stop.

**C. Offline-first**
The POS/business software continues functioning normally from a local database. When internet returns, it automatically syncs with your platform.

For example:

```text
Internet available

POS
 ↓
Local database
 ↓
Cloud sync
 ↓
account.company.com
```

Internet goes down:

```text
POS
 ↓
Local database

✓ Sales continue
✓ Receipts continue
✓ Inventory continues
✓ Customers continue

Cloud sync pauses
```

Internet comes back:

```text
Local changes
      ↓
Sync engine
      ↓
Cloud
```

For the Pakistani market, I strongly recommend **C — offline-first**, particularly for POS and operational business software.

However, licensing should also be designed intelligently. We should **not** make the POS contact your licensing server before every transaction.

Instead it could receive a signed license lease such as:

```text
License valid
Plan: Professional
Branches: 3
Valid until: 30 Sep
Offline grace period: 7 days
```

So a temporary internet outage doesn't shut down the customer's business.

Then your central platform remains authoritative while the operational product stays resilient.

**Do you want to lock Question 31 as C — offline-first for products that need it?**

#### Your response

> C

#### Explanation or resolution

Locked: **Question 31 = C — offline-first for products that need continuous operation**, especially POS and other shop/business systems.

That means internet loss should not stop normal work. Sales, receipts, inventory updates, customer records, etc. continue locally, then sync when connectivity returns. The central platform still controls subscriptions and licensing, but with a safe offline grace period rather than checking the server on every transaction.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
