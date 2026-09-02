# Phase 18 child plan — protected production baseline collection

**Status:** Approved as a no-customer-data evidence-collection child capability.

## Outcome

Record a comparable, privacy-minimized daily capacity and operational-health
baseline on the protected host without changing application behavior or creating
a new paid service.

## Requirement map

| Requirement                     | Evidence                                            |
| ------------------------------- | --------------------------------------------------- |
| Protected/manual access         | Production-environment workflow and successful run  |
| Aggregate-only record           | Schema validation and review of the workflow fields |
| Aggregate demand/failure signal | 24-hour Prometheus sums and aggregate outbox state  |
| Bounded retention and $0 cost   | 90-day cleanup and capacity-ledger entry            |
| No service mutation / rollback  | Workflow behavior and removal instructions          |

## Steps

1. `18.1-requirements-research` — freeze the aggregate field set, privacy
   boundary, retention, cost ceiling and rollback.
2. `18.2-protected-capture` — implement the protected workflow and record
   validator.
3. `18.3-verification-evidence` — run it against production and record the
   redacted result/evidence link.
4. `18.4-window-review` — validate the retained aggregate series and report
   whether enough distinct-day evidence exists for an individual proposal.
5. `18.5-operational-coverage` — add pre-existing aggregate traffic, failure,
   latency and outbox measurements without retaining labels or payloads.

## Ownership and dependencies

- Owns: `docs/execution/phase-18/production-baseline/`,
  `.github/workflows/phase18-production-baseline.yml`, Phase 18 evidence, and
  the Phase 18 capacity-ledger addition.
- Does not write: application schemas, APIs, canonical events, customer data,
  identity, billing, integration contracts, infrastructure topology or paid
  provider configuration.
- Depends on: existing protected production workflow secrets and the Phase 17
  stable deployment path.

## Verification

Run formatting checks, inspect the workflow's declared field allowlist, execute
the protected workflow, and verify its aggregate JSON record and 90-day
retention behavior. Store only the run link and redacted summary in Git.

## Merge and rollback

Merge after documentation/research. The workflow is additive and versionless;
rollback is removal of the workflow and its isolated protected-host directory.
