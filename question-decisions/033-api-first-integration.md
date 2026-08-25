# Question 033 — API-first integration

**Status:** Locked  
**Implementation:** Foundation in Phase 1; expansion in Phase 4  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should the central platform be API-first?

## Your chosen direction

Use versioned REST APIs, documented contracts and signed webhooks for application integration.

## Why this was chosen

Products and client systems can live on different databases and platforms without sharing persistence internals.

## Why it is a strong fit

- Preserves product autonomy
- Supports integrations
- Enables independent evolution

## Tradeoffs and safeguards

APIs and webhooks require compatibility, idempotency, authentication and operational monitoring.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 33 — API strategy

Now that we know products can live anywhere, should we make the central platform **API-first**, so your future applications can integrate with it through a documented API?

I strongly recommend **yes**.

That would eventually give your products endpoints conceptually like:

```text
api.company.com

/v1/auth
/v1/organizations
/v1/products
/v1/subscriptions
/v1/licenses
/v1/entitlements
/v1/payments
/v1/support
```

plus signed webhooks such as:

```text
subscription.activated
subscription.renewed
subscription.expired
license.revoked
payment.verified
```

Then a Flutter application, desktop POS, web SaaS, Python service, or external system can all integrate without being tied to the technology used by `account.company.com`.

**I recommend locking Question 33 as API-first + webhooks.**

#### Your response

> yes

#### Explanation or resolution

Locked: **Question 33 = API-first central platform + signed webhooks**.

That is an important architectural decision. Your future POS, Flutter apps, AI products, SaaS tools, or even third-party systems should integrate with the company platform through stable contracts rather than sharing its database.

Conceptually:

```text
                    api.company.com
                           │
          ┌────────────────┼────────────────┐
          │                │                │
      REST API         Webhooks        Auth / API keys
          │                │                │
          ▼                ▼                ▼
        POS            Flutter app       AI service
      Product A         Product B        Product C
```

For example, your POS might ask:

```http
GET /v1/entitlements
```

and receive:

```json
{
  "organizationId": "org_123",
  "product": "retail-pos",
  "subscription": "active",
  "plan": "professional",
  "features": [
    "inventory",
    "advanced-reports",
    "customer-credit"
  ],
  "limits": {
    "branches": 3,
    "users": 10
  }
}
```

And when something changes centrally:

```text
Payment verified
        ↓
Subscription renewed
        ↓
Webhook
        ↓
subscription.renewed
        ↓
Connected product updates itself
```

We should eventually have versioned APIs such as `/v1/...`, proper authentication, rate limiting, idempotency, audit logs, signed webhook payloads, retries, API documentation/OpenAPI, and backward-compatible changes.

But we don't need to expose 100 endpoints in V1. We establish the architecture and implement only what the first products actually need.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
