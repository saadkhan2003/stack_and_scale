# API Standards

## Scope and versioning

V1 exposes private REST APIs at `/api/v1`. First-party applications and explicitly approved product/partner integrations use the same documented contracts. A public developer platform, sandbox and self-service application registration are future work.

Breaking changes require `/v2` or a new resource. Additive fields are allowed when clients can ignore them. OpenAPI is generated from the API implementation and published as a build artifact; shared TypeScript types assist internal development but do not replace network contracts.

## Request rules

| Concern | Standard |
|---|---|
| Authentication | OIDC session or scoped service credential; credentials identify a human or service separately |
| Authorization | every request resolves actor, organization context, permission and record relationship before retrieval |
| Correlation | accept or create `X-Correlation-Id`; return it on every response and propagate it to jobs/events |
| Idempotency | required for payment, provisioning, webhook-triggered and retryable creation commands via `Idempotency-Key` |
| Concurrency | mutable resources expose a version/ETag; conflicting writes return `409` or `412` with a safe recovery path |
| Pagination | cursor pagination: `page[size]` maximum 100 and opaque `page[after]` cursor |
| Filtering/sorting | documented allow-list only; no raw query/SQL syntax; sort defaults are stable |
| Time | RFC 3339 UTC timestamps; ISO 4217 currency codes |

## Response and error shape

Success returns `{ "data": ... , "meta": ... }`. Failure returns no stack trace and uses:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "One or more fields are invalid.",
    "details": [{ "path": "email", "code": "invalid_format" }],
    "correlationId": "req_..."
  }
}
```

Use `400` malformed, `401` unauthenticated, `403` unauthorized, `404` non-disclosing absence where appropriate, `409` conflict, `422` valid syntax but invalid business state, `429` rate limited, and `5xx` operational failure. Error messages must not reveal cross-tenant record existence, secrets or provider responses.

## Compatibility and verification

Every endpoint has schema, authorization and negative-path tests. Contract changes run OpenAPI compatibility checks. Private integration credentials have owner, scopes, expiry/rotation path and audit trail; browser applications never receive service credentials.
