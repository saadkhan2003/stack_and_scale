# Phase 04 Verification — Data and Backend Foundation

## Status

**Documentation readiness established; implementation verification pending.**

This record is intentionally not a PASS. The requested recovery runbook has
been created, but it does not prove that Phase 04 application code, migration
runner, outbox worker, DLQ persistence or privacy orchestration are complete.
Only executed command output and scoped test evidence may change this record to
PASS.

## Recovery evidence

- Forward-only migration, outbox/DLQ and privacy recovery runbook:
  `docs/operations/PHASE-04-RECOVERY.md`
- Complete-system restoration order:
  `docs/operations/RESTORE-ORDER.md`
- Event/outbox, retry, DLQ and replay contract:
  `docs/architecture/EVENT-STANDARDS.md`
- Privacy request, deletion-propagation and restore-reconciliation contract:
  `docs/privacy/REQUEST-AND-DELETION-CONTRACT.md`
- Quality and release requirements:
  `docs/program/QUALITY-GATES.md`

## Required verification record

For the Phase 04 exit, record the date, commit SHA, runtime versions, command
output or report location, reviewer and result for every command below. Evidence
must contain no secret, personal data, raw export or recovery key.

| ID | Required command or check | Required result |
|---|---|---|
| V-01 | `pnpm format:check` | Pass |
| V-02 | `pnpm lint` | Pass |
| V-03 | `pnpm typecheck` | Pass |
| V-04 | `pnpm --filter @stack-and-scale/contracts test` | Event/privacy contract tests pass |
| V-05 | `pnpm --filter @stack-and-scale/database test` | Migration-policy and outbox/DLQ policy tests pass |
| V-06 | `pnpm --filter @stack-and-scale/workers test` | Worker idempotency/no-op foundation tests pass |
| V-07 | `pnpm --filter @stack-and-scale/api test` | API/domain tests pass |
| V-08 | `pnpm --filter @stack-and-scale/api test:integration` | API health and implemented data-path integration tests pass |
| V-09 | `pnpm build` | All packages/apps build |
| V-10 | Clean local PostgreSQL rehearsal in the runbook | Migration applies; `platform.outbox_events` exists; cleanup succeeds |
| V-11 | Forward-recovery rehearsal | A failed/incorrect migration scenario is corrected only by a reviewed forward path |
| V-12 | DLQ/replay rehearsal | Unauthorized replay is denied; authorized replay preserves original event ID and reaches terminal state idempotently |
| V-13 | Privacy lifecycle integration suite | Verification, scope, denial, export, correction, restriction, hold and audit paths pass |
| V-14 | Privacy propagation/recovery suite | Every configured target reports completion/exception/retry; restore reconciliation replays deletion ledger before exposure |

## Current limitations to close

1. The package script `pnpm --filter @stack-and-scale/database migrate` refers
   to a migration executable that is not yet present. The explicit local SQL
   rehearsal in the runbook is the temporary verification method, not a
   production deployment mechanism.
2. Phase 04 must add executable integration coverage for database-backed
   domains, the durable worker/outbox path, DLQ authorization/audit persistence
   and privacy orchestration before a PASS can be recorded.
3. Production migration, backup, restore and incident execution remain gated by
   Phases 10B and 11B. This record does not authorize infrastructure
   provisioning, provider purchases or production credentials.

## Exit decision template

Replace this section only after all V-01 through V-14 evidence is attached or
linked.

```text
Date:
Commit SHA:
Reviewer:
Results: V-01 … V-14 PASS / approved exception reference
Migration recovery rehearsal:
DLQ replay rehearsal:
Privacy propagation and restore-reconciliation rehearsal:
Decision: PASS / NO-GO
Follow-ups and owners:
```
