# Phase 04 — Data and Backend Foundation

## Outcome

Implement the modular NestJS backend, PostgreSQL lifecycle, reliable jobs/events, storage abstraction and contract-first API foundation required by V1 and later applications.

## Execution profile

- **Model tier:** strongest for domain/data architecture; default for adapters and tests
- **Mode:** serial on the critical path
- **External-platform spend:** $0 during local development
- **Depends on:** Phase 03
- **Unlocks:** Phases 05, 06, 09 and 11

## Work packages

### 04.1 Modular application kernel

- NestJS application structure and module-boundary enforcement.
- Configuration validation and startup failure rules.
- Request correlation and structured error model.
- Health, readiness and version endpoints.

### 04.2 Database foundation

- PostgreSQL connection and pool policy.
- Domain-owned schemas/tables and naming standards.
- Migration generation, review, test and production procedure.
- UTC time, money, identifiers, soft deletion and concurrency conventions.

### 04.3 Initial domains

- organizations and contacts;
- leads and activities;
- form submissions and consent evidence;
- demo bookings;
- audit events;
- integration deliveries.

Implement only fields required by V1 plus stable identifiers needed by future phases.

### 04.4 Reliable jobs and events

- Transactional outbox.
- Worker polling/queue adapter.
- Idempotency keys.
- Retry and dead-letter behavior.
- Job visibility and cancellation rules.

### 04.5 File/storage abstraction

- Local development adapter.
- S3-compatible adapter contract.
- Signed access, metadata, ownership and size/type validation.
- No broad public bucket credentials.

### 04.6 API contract

- OpenAPI output.
- Shared/generated contract package.
- Validation and stable error responses.
- Rate-limit and abuse-control extension points.

### 04.7 Test foundation

- Repository/module integration tests.
- Migration up/down or roll-forward tests as applicable.
- Outbox/job failure tests.
- API contract snapshots.
- Audit and redaction tests.

### 04.8 Privacy operations foundation

- Implement privacy-request records with requester identity verification, scope, status, deadlines, decisions and immutable audit events.
- Implement portable access export, authorized correction, processing restriction and erasure/anonymization orchestration for V1 domains.
- Store consent and preference history as versioned evidence rather than only current booleans.
- Implement configurable retention schedules and a dry-run/report mode before destructive enforcement.
- Publish deletion/retention events for CMS, analytics, search, logs and file adapters; record completion, exception or retry for each target.
- Model legal holds and statutory/business retention exceptions with authority, reason and expiry.

## Verification

```text
pnpm --filter api lint
pnpm --filter api typecheck
pnpm --filter api test
pnpm test:integration
pnpm db:migrate:test
pnpm contracts:check
```

## Exit criteria

- API and worker start against a clean migrated database.
- Module boundaries are mechanically enforced.
- Duplicate requests/jobs cannot create duplicate critical records.
- OpenAPI and runtime behavior agree.
- Logs exclude secrets and classified payloads.
- A failed migration or job has a documented recovery path.
- Privacy requests can be authenticated, tracked, exported and propagated without silently deleting audit or legally retained evidence.

## Rollback and recovery

Use additive, backward-compatible migrations. Revert application code independently where possible; use controlled roll-forward migrations when destructive rollback would risk data.

## Cold-start handoff

Read Phase 03 domain/API/event standards. Do not implement staff, portal, billing or product-control-plane features in this phase.
