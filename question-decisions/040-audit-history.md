# Question 040 — Audit history

**Status:** Locked  
**Implementation:** Foundation in Phase 1; expanded in Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How much business and security activity should be recorded?

## Your chosen direction

Maintain comprehensive audit logs for important business and security actions.

## Why this was chosen

The platform will handle permissions, payments, publishing, customer records and approvals that need accountable history.

## Why it is a strong fit

- Improves security investigations
- Supports compliance
- Makes operational disputes easier to resolve

## Tradeoffs and safeguards

Audit payloads must avoid secrets and unnecessary personal data and require retention controls.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 40 — Audit logs and activity history

Because `staff.company.com` will eventually contain customers, money, subscriptions, leads, projects, permissions, and support, should important actions have a permanent activity trail?

For example:

```text
Payment #PAY-1048

14:22
Payment submitted by customer

14:27
Verified by Finance User

14:28
Invoice marked Paid

14:28
Subscription renewed until 24 Sep 2026
```

Or:

```text
Customer: Khan Super Store

Ali changed plan:
Professional → Business

Sara changed branch limit:
3 → 5

Owner revoked user:
employee@example.com

System disabled license:
Subscription expired
```

And for security:

```text
User logged in
Password changed
2FA enabled
Role changed
Permission granted
API key created
API key revoked
Session terminated
```

I strongly recommend **Yes — comprehensive audit logs for important business and security actions**.

Normal harmless UI actions don't need auditing, but anything involving **money, access, permissions, customers, subscriptions, licenses, projects, support decisions, or important data changes** should be traceable.

Do you want to lock **Question 40 = comprehensive audit/activity logging**?

#### Your response

> Notification Preferences
> 
> New lead assigned
> ✓ In-app
> ✓ Email
> 
> Demo scheduled
> ✓ In-app
> ✓ Email
> 
> Payment received
> ✓ In-app
> ✓ Email
> 
> Support ticket reply
> ✓ In-app
> ✓ Email
> 
> Project milestone completed
> ✓ In-app
> ✓ Email
> 
> Subscription expiring
> ✓ In-app
> ✓ Email
> A user can control these individually.
> Internally, I would avoid writing:
> sendEmail(...)
> inside every feature.
> Instead:
> Something happens
>       ↓
> Domain Event
>       ↓
> Notification Service
>       ↓
> ┌───────────────┐
> │               │
> ▼               ▼
> In-app          Email
> For example:
> payment.verified
> subscription.expiring
> ticket.assigned
> ticket.replied
> demo.scheduled
> lead.assigned
> project.milestone.completed
> This means we could add another delivery channel years later without redesigning leads, billing, support, projects, etc.
> We should also distinguish notifications by audience:
> staff.company.com
> → sales / finance / support / project notifications
> 
> portal.company.com
> → client project notifications
> 
> account.company.com
> → subscription / payment / product / support notifications
> 
> admin.company.com
> → CMS/system administration notifications
> And the in-app notification center can support:
> Unread/read
> Mark all as read
> Deep links
> Timestamp
> Notification category
> Priority
> Archive
> Email should use proper branded transactional templates rather than plain ugly system emails...yes
> 
> 
> and yes the I strongly recommend Yes — comprehensive audit logs for important business and security actions.

#### Explanation or resolution

Locked on both.

For **notifications**, V1 will use only **in-app + email**, with per-event preferences. Internally we’ll use a domain-event → notification-service pattern, so leads, demos, payments, tickets, milestones, subscriptions, and future events can trigger notifications cleanly without hard-wiring email logic into every feature.

For **audit logging**, we’ll keep a comprehensive history for important business and security actions: payments, subscription changes, license changes, customer/account changes, role and permission changes, API key creation/revocation, login/security events, project changes, support decisions, and other sensitive operations. Routine UI interactions will not clutter the audit trail.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
