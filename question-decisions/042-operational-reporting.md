# Question 042 — Operational reporting

**Status:** Locked  
**Implementation:** Basic in Phase 2; advanced in Phase 5  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How advanced should reporting be?

## Your chosen direction

Design for advanced reporting but deliver it in phases.

## Why this was chosen

Sales, subscriptions, projects, support and finance need shared metrics, yet an analytics warehouse is unnecessary on day one.

## Why it is a strong fit

- Creates a coherent metric model
- Avoids early warehouse complexity
- Supports future forecasting

## Tradeoffs and safeguards

Uncontrolled reporting queries can harm the transactional database and need read models as volume grows.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 42 — Reporting and analytics inside `staff.company.com`

You already want **Reports** in the staff dashboard. We need to decide how deep this goes.

**A. Basic operational reports**
- leads by status
- demos booked
- sales won/lost
- payments received
- active subscriptions
- support tickets
- active projects

**B. Business intelligence dashboard**
Everything in A, plus:
- conversion rate
- revenue by product
- revenue by city
- lead source performance
- average sales cycle
- customer retention
- churn
- recurring revenue
- overdue invoices
- support response time
- project profitability
- staff performance

**C. Advanced analytics layer**
Everything in B, plus:
- custom date filters
- saved report views
- CSV/Excel export
- scheduled email reports
- charts
- cohort analysis
- funnel analysis
- product usage summaries
- future data warehouse/BI integration

For your long-term system, I recommend **C**, but V1 can start with the most valuable reports and expand without redesigning the reporting layer.

Would you like to lock **C — advanced reporting architecture, phased implementation**?

#### Your response

> C

#### Explanation or resolution

Locked: **Question 42 = C — advanced reporting architecture, implemented in phases**.

So `staff.company.com` should eventually support operational reporting, business intelligence, custom date ranges, exports, saved views, funnels, recurring revenue/churn metrics, lead-source performance, project profitability, support metrics, and future BI/data-warehouse integration.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
