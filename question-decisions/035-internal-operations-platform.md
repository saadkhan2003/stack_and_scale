# Question 035 — Internal operations platform

**Status:** Locked  
**Implementation:** Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should employees have one internal workspace?

## Your chosen direction

Make staff.company.com a first-class operational platform separate from the CMS.

## Why this was chosen

Content publishing and daily business operations have different users, risks and workflows.

## Why it is a strong fit

- Unifies CRM and operations
- Keeps CMS responsibilities clear
- Provides one staff entry point

## Tradeoffs and safeguards

The platform should integrate specialist tools where useful instead of rebuilding every category.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 35 — internal company dashboard

We've now discussed CMS, CRM, customer accounts and client portals. There is another system we need to decide on.

Do you want **your own employees** to eventually have one internal workspace such as:

```text
staff.company.com

Dashboard
├── Leads / CRM
├── Customers
├── Projects
├── Product subscriptions
├── Payments
├── Demo bookings
├── Support tickets
├── Client accounts
├── Product instances
├── Team tasks
└── Reports
```

instead of your staff jumping between `admin`, CRM, account management and other tools?

For what you're building, **I recommend yes**. Then `admin.company.com` remains mainly the CMS/technical administration, while `staff.company.com` becomes the actual operational workspace for your company.

#### Your response

> yes is strongly wants that staff.company.com
> 
> Dashboard
> ├── Leads / CRM
> ├── Customers
> ├── Projects
> ├── Product subscriptions
> ├── Payments
> ├── Demo bookings
> ├── Support tickets
> ├── Client accounts
> ├── Product instances
> ├── Team tasks
> └── Reports

#### Explanation or resolution

Locked strongly: **`staff.company.com` will be a first-class internal operations platform**, not an afterthought.

This is now one of the core parts of the architecture.

```text
staff.company.com

Dashboard
├── Leads / CRM
├── Customers
├── Projects
├── Product subscriptions
├── Payments
├── Demo bookings
├── Support tickets
├── Client accounts
├── Product instances
├── Team tasks
└── Reports
```

And I want to keep its purpose very clear:

- `admin.company.com` = **CMS / content administration**
- `staff.company.com` = **day-to-day company operations**
- `portal.company.com` = **custom development clients**
- `account.company.com` = **customers using your products**
- `www.company.com` = **public marketing website**
- `api.company.com` = **central integration/API layer**

That separation is excellent for long-term maintainability.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
