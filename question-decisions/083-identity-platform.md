# Question 083 — Identity platform

**Status:** Locked  
**Implementation:** Phase 0 and Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should identity be embedded in each application or provided centrally?

## Your chosen direction

Use a dedicated standards-based identity service built around OIDC and OAuth2, with separate authorization contexts.

## Why this was chosen

One identity foundation can support staff, clients, customers and service accounts while applications retain their own role boundaries.

## Why it is a strong fit

- Consistent authentication
- Supports federation and MFA
- Avoids duplicated security logic

## Tradeoffs and safeguards

Provider selection and migration planning are critical because identity is a high-impact dependency.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

## Question 83 — Authentication and identity system

Now we need to decide the identity architecture because you have:

```text
Users

├── Staff users
│   └── staff.company.com

├── Clients
│   └── portal.company.com

├── Product customers
│   └── account.company.com

├── CMS users
│   └── admin.company.com

└── Future developers/API users
```

Authentication options:

### A. Build authentication ourselves

You handle:

- passwords
- sessions
- MFA
- password resets
- security policies

❌ Not recommended.

Authentication is too sensitive.

---

### B. Use a managed identity provider

Examples:

- Auth0
- Clerk
- WorkOS
- Keycloak (self-hosted)

Pros:

- secure authentication
- MFA
- social login
- enterprise features

---

### C. Self-hosted identity platform

Example:

- Keycloak

You control infrastructure.

Pros:
- ownership
- customization
- no vendor lock-in

Cons:
- you manage security updates and operations

---

### D. Hybrid identity architecture (recommended)

Use a dedicated identity service:

```text
Identity Provider

        ↓

Your Applications

├── Website
├── Staff
├── Portal
├── Account
└── API
```

With:

- OAuth2/OIDC
- MFA
- session management
- RBAC
- SSO capability
- API tokens

Your business systems do not store passwords directly.

---

My recommendation:

**D — dedicated identity architecture using standards (OIDC/OAuth2), with self-hosted or managed provider depending on final deployment decision.**

This matches everything we already decided:

- role-based permissions
- custom permission overrides
- audit logs
- enterprise readiness

Do you want to lock **D — hybrid identity architecture?**

#### Your response

> D

#### Explanation or resolution

Locked: **Question 83 = D — hybrid identity architecture using standards (OIDC/OAuth2), with a dedicated identity service.**

This is a major architectural decision because identity becomes the foundation for everything:

```text
Identity Platform

        ↓

Applications

├── www.company.com
│
├── staff.company.com
│
├── portal.company.com
│
├── account.company.com
│
├── admin.company.com
│
└── Future APIs / Mobile Apps
```

---

The core principle:

> Applications should not manage passwords themselves. Identity should be a dedicated platform.

---

Authentication capabilities:

```text
Identity System

✓ Login
✓ Registration
✓ Password management
✓ Email verification
✓ MFA / 2FA
✓ Session management
✓ Device tracking
✓ OAuth/OIDC
✓ SSO capability
✓ API authentication
✓ Security events
```

---

Authorization remains your responsibility:

Important distinction:

Authentication:

> "Who are you?"

Authorization:

> "What are you allowed to do?"

Example:

```text
User:
Ali

Authentication:
✓ Logged in

Authorization:

Role:
Sales Manager

Permissions:
✓ View leads
✓ Create proposals
✓ Approve discounts <20%

Denied:
✗ View financial reports
✗ Manage system permissions
```

---

Identity + your permission system:

```text
Identity Provider

        ↓

User Identity

        ↓

Your Authorization Layer

├── Roles
├── Permissions
├── Organizations
├── Teams
├── Custom overrides
└── Audit rules
```

---

Future support:

### Enterprise clients

Later:

```text
Client Company

Microsoft Entra ID
Google Workspace
Okta

        ↓

Your Platform

        ↓

SSO Login
```

---

### Mobile apps

Your Flutter apps can use the same identity:

```text
Flutter App

        ↓

OIDC Authentication

        ↓

Company Identity Platform

        ↓

API Access
```

---

### API users

Future developers/integrations:

```text
External System

        ↓

API Key / OAuth Client

        ↓

Your API
```

---

Implementation direction:

Initial options:

- Keycloak self-hosted on Hetzner
- Auth0/WorkOS/Clerk if operational simplicity is preferred

But the architecture remains:

```text
OIDC
+
OAuth2
+
JWT
+
RBAC
+
Audit Logging
```

So changing providers later does not break your applications.

---

This connects with previous decisions:

✅ role-based permissions
✅ custom permission overrides
✅ audit logs
✅ privacy-first architecture
✅ enterprise readiness
✅ future client portals

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
