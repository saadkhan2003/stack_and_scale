# Question 028 — Authentication capabilities

**Status:** Locked  
**Implementation:** Foundation in Phase 1; full use in Phase 3  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

What authentication model should customer-facing applications use?

## Your chosen direction

Use a full modern authentication architecture with verification, recovery, MFA readiness, session management, protection controls and organization roles.

## Why this was chosen

Customer portals will contain billing, licenses, project files and business records that require more than basic login forms.

## Why it is a strong fit

- Stronger account security
- Supports organizations and devices
- Allows stricter staff policies

## Tradeoffs and safeguards

Only needed features should be exposed initially; complexity must not make basic sign-in unreliable.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 28 — Authentication strategy

You will eventually have three different kinds of authenticated users:

- CMS staff on `admin.company.com`
- Custom-development clients on `portal.company.com`
- Product customers on `account.company.com`

How do you want login to work for your **customers and clients**?

**A. Email + password only**

**B. Email + password + optional Google login**

**C. Passwordless / magic-link login**

**D. Full modern authentication**
Email/password, Google, password reset, email verification, MFA/2FA, session/device management, rate limiting, suspicious-login protection, and organization-based permissions.

For a production system handling subscriptions, invoices, licenses, project documents and customer data, I recommend **D**, but we can expose only the simple parts initially.

For example, V1 might visibly offer:

```text
Email
Password
Remember me

[ Sign In ]

Forgot password?
```

while the backend is already structured for:

```text
Email verification
2FA
Google login
Session revocation
Device history
Organization roles
Security audit logs
```

I would also keep the **staff CMS authentication more restrictive** than customer authentication.

Do you want to lock **D** for authentication?

#### Your response

> D

#### Explanation or resolution

Locked: **Question 28 = D — full modern authentication architecture.**

So customer-facing auth should ultimately support email/password, verification, password reset, MFA/2FA, optional social login, secure session/device management, rate limiting, audit logs, organization roles, and the ability to revoke sessions. CMS staff authentication will be even stricter.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
