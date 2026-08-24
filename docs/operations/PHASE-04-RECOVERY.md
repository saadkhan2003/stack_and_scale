# Phase 04 Recovery Runbook — Data, Migrations, Events and Privacy

## Purpose and authority

This runbook defines the Phase 04 recovery behavior for PostgreSQL migrations,
the transactional outbox/dead-letter queue (DLQ), and privacy operations. It
implements the recovery intent in `plans/phase-04-data-backend-foundation.md`
and is subordinate to the complete-system recovery order, event standards and
privacy request/deletion contract.

Use this runbook for a failed migration, interrupted job delivery, or a
privacy-operation failure. Do not use it to improvise a production database
change. Production recovery additionally requires the incident process,
approved access under the secrets ADR, and the restore order in
`docs/operations/RESTORE-ORDER.md`.

## Non-negotiable safeguards

- Production migrations are version-controlled, immutable after deployment and
  applied only through the approved release path.
- Production recovery is forward-only. Do not run a migration down command,
  edit an applied migration, restore a stale database over the current
  production database, or manually alter a production table to "undo" a
  release.
- Stop or disable the affected write path before recovery when continued writes
  would compound inconsistency. Preserve correlation IDs, migration IDs,
  release identifiers and error evidence.
- Use a clean isolated database for rehearsal and forensic comparison. Never
  copy production personal data into local, test, preview or staging
  environments.
- A restore can reintroduce pre-erasure data. Reconciliation must replay the
  completed deletion/anonymization ledger before restored data is exposed.

## Migration recovery

### Required migration record

Every migration change record must identify the migration ID, owning domain,
release, compatibility state, affected tables/indexes, data/backfill work,
expected lock behavior, test evidence, forward-recovery migration and an
operator rollback decision. Schema DDL and large data backfills are separate
changes. Additive, backward-compatible expand/contract changes are the default.

### Before applying

1. Confirm the release is compatible with both the current and target schema.
2. Confirm a database-consistent backup/readiness check passed and the exact
   restore point is known.
3. Rehearse the migration on a clean isolated database; for any material data
   change, use a permitted production-like synthetic dataset and record timing,
   lock and row-count evidence.
4. Ensure a named owner is watching application errors, database health and
   outbox lag. Pause background consumers when a schema change could make them
   incompatible.
5. Create and review a new forward-recovery migration before touching
   production if the change has meaningful data-loss or availability risk.

### Failure decision tree

| Situation | Immediate action | Recovery action | Completion condition |
|---|---|---|---|
| Migration fails before committing | Stop promotion; preserve error and migration ID | Correct the defect in a new migration or release; rerun only after isolated rehearsal | Schema history and application release are unchanged or proven compatible |
| Migration commits but new release is unhealthy | Stop the affected traffic/write path | Revert only application code if it remains compatible; otherwise deploy a new forward migration and compatible release | Health, data-integrity and contract checks pass |
| Incorrect data was written by a backfill | Stop the backfill and preserve affected identifiers | Use an approved, scoped forward correction migration; do not restore the whole live database over unrelated writes | Reconciliation proves intended rows only were corrected |
| Destructive change or broad corruption | Declare an incident and freeze writes | Restore into isolation, determine last safe point, plan controlled restoration and deletion-ledger reconciliation; obtain incident-owner approval before cutover | Restore, security, tenant, privacy and business smoke tests pass |
| Unknown schema history/drift | Do not apply another migration | Compare recorded migration history, repository release and isolated database schema; resolve by reviewed forward migration | Drift report and repair evidence are attached to incident/release record |

### Post-recovery checks

Run the migration-policy tests, clean-database migration rehearsal, API/worker
compatibility checks, outbox backlog check and relevant privacy reconciliation
tests. Record the starting/ending migration IDs, row-count assertions,
application version, operator, approver and rollback result without including
personal data or secrets.

## Outbox and DLQ recovery

### Model

The command that changes domain state writes its outbox event in the same
transaction. Workers provide at-least-once delivery: consumers must be
idempotent using the event ID or a domain-specific idempotency key. Retries use
bounded exponential backoff with jitter. A delivery that reaches its configured
limit moves to the DLQ with an owner, classification, correlation ID and manual
replay record.

### Recovery procedure

1. Identify the event ID, event type, source-domain record, correlation ID,
   delivery target, attempt count and error classification.
2. Verify source state before doing anything. A replay never recreates or
   silently changes the original domain command.
3. Classify the failure: transient dependency, invalid payload/contract,
   authorization/secret rotation, destination rejection, consumer defect, or
   permanent business-rule failure.
4. For transient failures, correct the dependency and allow the bounded retry
   schedule to continue. Do not create a duplicate outbox row.
5. For a DLQ item, fix the cause first, then obtain the assigned owner's
   authorization. Record the approver, reason, remediation and original event
   ID before manual replay.
6. Replay using the original event ID and idempotency key. Observe the delivery
   to a terminal state. If replay fails again, return it to DLQ with the new
   evidence; do not loop indefinitely.
7. For a consumer defect, deploy a compatible fix before replaying only the
   affected event set. Confirm duplicate and out-of-order handling remains
   correct.
8. Escalate failed critical lead, email, webhook, payment, provisioning or
   privacy propagation deliveries using the operational alert path.

### Prohibited actions

- Deleting a failed event to make a queue appear healthy.
- Replaying without authorization or replacing the original event ID.
- Editing historical payloads in place.
- Calling a downstream service manually without creating the required replay
  audit record.
- Claiming exactly-once delivery; recovery assumes duplicate delivery is
  possible and verifies idempotency.

### Exit evidence

The recovery record contains the original and final event state, delivery
attempts, correlation ID, owner/approver, cause, remediation, replay result,
consumer idempotency evidence and any affected privacy-operation status.

## Privacy-operation implementation readiness

Phase 04 must implement the lifecycle and safeguards below before Phase 12 can
launch V1. This section is a readiness checklist; it does not treat a contract
or a unit test as completed end-to-end privacy operations.

| Capability | Phase 04 implementation requirement | Recovery/readiness evidence |
|---|---|---|
| Intake and verification | Persist request ID, requester kind, verification outcome, bounded scope, deadline, actor and correlation ID; deny unverified/mismatched requests | Tests cover account holder, unauthenticated lead, representative, delegate and denied challenge cases |
| Lifecycle and audit | Enforce `received → identity_verified → scoped → approved/refused → executing → completed/exception_held`; audit every state change with minimized evidence | Invalid transitions and unauthorized staff actions fail closed |
| Access/export/correction/restriction | Execute only against verified scope and tenant; generate portable export without secrets or third-party data | Authorization-denial, export completeness and restricted-processing tests |
| Erasure/anonymization | Record per-target orchestration status for transactional data, CMS, analytics, search, files, logs/expiry, processors and backups | Completion, exception and retry evidence exists for every configured target |
| Hold and retention | Store hold authority, reason, scope, review and expiry; run retention in dry-run mode before approved destructive execution | A scoped hold blocks only affected deletion and expiry resumes after release |
| Restore reconciliation | Maintain the minimal deletion/anonymization ledger needed after recovery | Isolated restore test replays completed erasures before traffic/writes resume |

### Privacy failure handling

1. Stop the affected propagation target or privacy workflow without exposing
   additional personal data.
2. Mark the request/target as retrying or exception-held with owner, reason and
   review time; never falsely mark it completed.
3. Preserve minimal audit evidence and correlation IDs. Do not paste exports,
   identity documents or secrets into issue trackers or evidence files.
4. Resolve authorization, contract, adapter or retention/hold cause, then retry
   idempotently for the same request and target.
5. If a restore occurred, reconcile completed deletion/anonymization ledger
   entries before data is made available. A hold may delay only its scoped
   destructive action.
6. Escalate suspected unauthorized disclosure, cross-tenant data access or
   failure to contain data according to the incident policy and quality gates.

## Exact verification command list

Run these commands from the repository root in the stated order. Commands use
only local synthetic data. `pnpm db:down` is cleanup and must run after any
local PostgreSQL rehearsal.

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter @stack-and-scale/contracts test
pnpm --filter @stack-and-scale/database test
pnpm --filter @stack-and-scale/workers test
pnpm --filter @stack-and-scale/api test
pnpm --filter @stack-and-scale/api test:integration
pnpm build
pnpm db:up
pnpm db:reset
docker compose -f infra/compose.yaml exec -T postgres \
  psql -v ON_ERROR_STOP=1 -U stack_and_scale -d stack_and_scale \
  -f - < packages/database/migrations/0001_initial_v1.sql
docker compose -f infra/compose.yaml exec -T postgres \
  psql -v ON_ERROR_STOP=1 -U stack_and_scale -d stack_and_scale \
  -c "SELECT to_regclass('platform.outbox_events') AS outbox_table;"
pnpm db:down
```

The migration command is intentionally explicit until Phase 04 adds a verified
repository migration runner. Do not use the currently declared database
`migrate` package script as evidence until its referenced executable exists and
the command has passed the clean-database rehearsal.

For an implemented privacy orchestration, add and execute targeted integration
commands for request lifecycle, authorization denial, each deletion target,
hold/retention and restore-ledger reconciliation. Their exact package scripts
and test paths must be recorded in the Phase 04 verification evidence before
the phase exit is approved.

## Phase exit gate

Phase 04 may exit only when the verification record shows all required commands
passed, migration recovery has been rehearsed, DLQ replay is authorized and
audited, privacy-operation readiness is implemented and tested, and any failure
is linked to a safe forward recovery path.
