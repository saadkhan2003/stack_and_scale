# Phase 18 production-baseline verification

## Delivered capability

`.github/workflows/phase18-production-baseline.yml` is a protected,
manual-only collector for the evidence window required before any advanced
Phase 18 capability can be justified. It is deliberately limited to aggregate
host/database capacity values and leaves every application service and
canonical business record untouched.

## Local verification

- `pnpm format:check` passed after the workflow and documentation change.
- The schema validator was exercised with a representative valid record. It
  accepted only the frozen top-level, host and database field allowlists.
- The failed first live run (`33657296339`) exposed an `awk` built-in variable
  collision before a record was written. Commit `6570acb` renamed the variable;
  the revised collector then passed its real protected-host run.

## Protected production verification

[Run 33657394558](https://github.com/saadkhan2003/stack_and_scale/actions/runs/33657394558)
completed successfully on 2026-09-02 from `6570acb`. The host wrote and
validated a schema `1.0` record with the approved `phase-18-evidence-window`
reason, then applied the targeted 90-day retention cleanup.

The workflow’s redacted summary confirmed the running production image
`033ff34896472ebbe202f41ac43867cee8487711`, 14 running services and 8
PostgreSQL connections. Raw measurements remain only at
`/opt/stack-and-scale/evidence/phase18/baselines/` with restrictive file
permissions and are not copied into Git.

## Safety and rollback

- No credential, connection string, customer/account identifier, request,
  search term, support content, or other personal data appears in the record
  or this evidence.
- The collector has no API, schema, deployment, customer-data, or paid-provider
  mutation path.
- Rollback is removal of the workflow and the isolated host evidence directory;
  the existing staff capacity view remains available.

## Phase 18 status

This successful record starts the measurement capability; it is not yet a
meaningful production evidence window and does not authorize analytics, AI,
automation, public APIs, or regional scaling. Those remain individually gated
by [the Phase 18 evidence memo](../../../execution/phase-18/EVIDENCE-MEMO.md).

## Scheduled evidence window

Commit `0d00602` added the bounded daily 03:17 UTC trigger. It selects the
fixed `routine` reason, retains the same production-environment guard,
concurrency lock, field allowlist and 90-day cleanup as manual captures. The
manual dispatch path using the updated event-aware reason selection passed in
[run 33660828944](https://github.com/saadkhan2003/stack_and_scale/actions/runs/33660828944).

The scheduled collector is still not customer telemetry: it creates one
aggregate capacity record per day and has no API, customer-data, or
application-service mutation path. A meaningful evidence window requires time
and representative production operation; no advanced Phase 18 child is
authorized until that window identifies a measured bottleneck.
