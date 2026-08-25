# Question 036 — Staff authorization

**Status:** Locked  
**Implementation:** Foundation in Phase 1; full use in Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should all staff see everything?

## Your chosen direction

Use role-based permissions with carefully controlled custom overrides.

## Why this was chosen

Sales, finance, support, delivery and content teams need different access, while a rigid role list cannot cover every real exception.

## Why it is a strong fit

- Least-privilege access
- Flexible team structure
- Clear responsibility boundaries

## Tradeoffs and safeguards

Overrides can become confusing and must be visible, auditable and reviewable.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 36 — Staff roles and permissions

Inside `staff.company.com`, should every employee see everything?

I recommend **no**.

For example:

```text
Owner / Super Admin
→ everything

Sales
→ leads
→ demo bookings
→ customers
→ quotations
→ follow-ups

Project Manager
→ projects
→ milestones
→ clients
→ tasks
→ project reports

Finance
→ invoices
→ payments
→ subscriptions
→ financial reports

Support
→ tickets
→ customers
→ product instances
→ support history

Developer
→ assigned projects
→ technical tasks
→ releases
→ product instances
→ limited client information
```

Then each employee only sees what they need.

We can also support custom permissions later, like:

```text
can_view_payments
can_edit_customers
can_assign_leads
can_close_tickets
can_manage_projects
can_view_reports
can_manage_staff
```

My recommendation is:

**role-based permissions + custom permission overrides**.

That gives you control without making the system rigid.

Do you want to lock Question 36 as **role-based access with custom overrides**?

#### Your response

> yes

#### Explanation or resolution

Locked: **Question 36 = role-based permissions + custom permission overrides**.

So `staff.company.com` will have sensible default roles, but you can still fine-tune access per person. For example, a Sales user could normally see leads and demos, but you could also explicitly grant them permission to view payments or deny access to customer exports.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
