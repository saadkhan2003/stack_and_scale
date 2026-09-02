# Phase 18 production-baseline collection research

## Problem and decision

Phase 18 cannot justify a new analytics, automation, AI, search, API-platform,
or regional capability without a meaningful production evidence window. The
current system has an on-demand capacity view and one-off protected snapshots,
but no comparable retained series of aggregate production measurements.

The approved child capability is therefore **production-baseline collection**:
a protected daily or manual capture that stores only host/database aggregate capacity
measurements. It creates no customer-facing behavior, new data store,
third-party account, canonical business record, or usage-priced service.

## Existing-system findings

- `CapacitySnapshotService` already bounds its staff-only view to CPU, memory,
  disk, PostgreSQL connections and retention controls.
- Phase 15 has a protected one-off host capture, but its output is intentionally
  not committed and is not a retained, machine-readable series.
- The capacity ledger explicitly requires timestamp, workload/version, CPU,
  memory, disk, I/O, database connections/query latency, queue latency, backup
  volume and telemetry retention before capacity claims.
- Current Phase 15–17 evidence is synthetic QA. It proves release safety but
  does not establish customer demand, search quality, repetitive workload, or
  a scale bottleneck.

## External research findings

GitHub environments can protect jobs, gate access to environment secrets, and
record deployment/workflow history. `workflow_dispatch` supplies typed manual
inputs from the default branch, while scheduled workflows run from the default
branch. These support a protected, bounded evidence series without exposing
production SSH material to ordinary CI. Sources: [GitHub
deployment environments](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments),
[workflow dispatch syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax),
and [deployment controls](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments).

## Design

The workflow will:

1. run daily at 03:17 UTC or on a protected manual dispatch, using the existing
   `production` environment and its approval/secrets;
2. allow only one capture at a time through a production-specific concurrency
   group;
3. write a restrictive-permission JSON record on the protected host under
   `/opt/stack-and-scale/evidence/phase18/baselines/`;
4. retain the latest 90 days and remove older aggregate records only;
5. capture timestamp, deployed image tag, normalized load, memory/disk use,
   database connection count/database bytes, and running service count;
6. validate every written record has only the declared aggregate fields; and
7. print only a redacted success summary, never an SSH key, connection string,
   query text, customer content, user identifier, or credential.

The companion review action validates every retained record against the same
allowlist and reports only aggregate window maturity. A child-capability
proposal remains blocked until there are at least 28 valid samples spanning 21
distinct calendar days; this prevents multiple same-day manual captures from
being treated as a production evidence window.

The design intentionally does **not** collect request bodies, URLs, search
terms, support text, CRM records, client/account identifiers, IP addresses, or
any individual-level telemetry.

## Capacity, cost, security, and rollback

| Aspect         | Decision                                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Cost           | $0 incremental cost; small local JSON records only.                                                                               |
| Storage        | At most 90 daily-ish records; remove records older than 90 days.                                                                  |
| Security       | Existing protected environment, least `contents: read`, pinned host key, no secrets in output.                                    |
| Privacy        | Aggregate host/database values only; no product/customer/person data.                                                             |
| Rollback       | Disable/delete the workflow and remove only `/opt/stack-and-scale/evidence/phase18/baselines`; production services are untouched. |
| Success metric | A valid protected record can be captured, schema-checked and retained without changing a production service.                      |

## Non-goals

- This is not a warehouse, analytics product, observability vendor, customer
  telemetry system, or scale upgrade. Its single daily scheduled capture is a
  bounded evidence collector, not an application background agent.
- It does not satisfy the Phase 18 meaningful-evidence window by itself; it
  makes that later evidence possible.
