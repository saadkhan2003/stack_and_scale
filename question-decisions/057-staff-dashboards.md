# Question 057 — Staff dashboards

**Status:** Locked  
**Implementation:** Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should dashboards be fixed or customizable?

## Your chosen direction

Use role-aware defaults with approved widgets that users can add, remove and reorder.

## Why this was chosen

Different roles need different information, but unrestricted dashboard building would create inconsistency and maintenance burden.

## Why it is a strong fit

- Relevant views by role
- Personal productivity
- Controlled customization

## Tradeoffs and safeguards

Widget data access and performance must follow the same permissions as source modules.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 57 — Should staff dashboards be customizable?

Different staff roles care about completely different information.

A salesperson may want:

```text
My Leads
Today's Demos
Follow-ups Due
Pipeline Value
Quotes Awaiting Response
Won This Month
```

Finance may want:

```text
Payments Today
Outstanding Invoices
Overdue Accounts
MRR
Renewals Due
Refunds
```

Support may want:

```text
Open Tickets
Urgent Tickets
SLA Risks
My Assigned Tickets
Recently Offline Product Instances
```

And **you as owner** might want:

```text
Revenue
MRR / ARR
New Leads
Conversion Rate
Active Customers
Outstanding Money
Product Subscriptions
Project Health
Support Health
Team Workload
Recent Activity
```

I recommend a **role-aware dashboard with customizable widgets**: sensible defaults for every role, but you can add/remove/reorder widgets and save personal views.

So it doesn't become a chaotic drag-and-drop page builder; we provide an approved library of well-designed dashboard widgets.

**Question 57: lock role-aware + customizable staff dashboards?**

#### Your response

> yes

#### Explanation or resolution

Locked: **Question 57 = role-aware + customizable staff dashboards**.

So each role gets a strong default dashboard, but authorized users can personalize it using an approved widget library rather than an unrestricted page builder.

For example, your owner dashboard could include:

```text
Revenue
MRR / ARR
Active Customers
New Leads
Pipeline Value
Conversion Rate
Outstanding Invoices
Renewals Due
Open Support Issues
Project Health
Staff Workload
Recent Activity
System Health
```

A salesperson, finance user, developer, or support agent would see a different default set.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
