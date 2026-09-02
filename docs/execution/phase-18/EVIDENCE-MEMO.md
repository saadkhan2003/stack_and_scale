# Phase 18 evidence and prioritization memo

**Decision date:** 2026-09-02  
**Status:** No Phase 18 child capability is approved for implementation.

## Decision

Do not activate advanced analytics, specialist search, marketing automation,
workflow automation, AI-assisted features, a public developer platform,
regional infrastructure, or additional compliance tooling at this time.
Phase 18 is a portfolio gate, not blanket implementation authorization. The
required meaningful production evidence window does not yet exist.

## Evidence reviewed

| Required baseline                                  | Current evidence                                                                                                                | Finding                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Traffic, latency, database and infrastructure cost | The capacity ledger contains planning allocations and control thresholds, not a representative customer-production measurement. | No measured scale, query, availability, or cost bottleneck.                                 |
| Client/product usage                               | Phases 15–17 include isolated synthetic-account rollout verification.                                                           | Synthetic QA proves safety, not user demand, workload, or operational value.                |
| Search quality                                     | No production search-failure, zero-result, relevance, or authorization-escape dataset exists.                                   | Specialist search is not justified.                                                         |
| Staff workload and support volume                  | No sustained queue, support, conversion, or repetitive-process baseline exists.                                                 | Automation and AI are not justified.                                                        |
| Integration load                                   | Phase 17’s synthetic installation passed bounded protocol and toggle checks.                                                    | This establishes a safe baseline; it does not demonstrate a public developer-platform need. |

Sources: [capacity ledger](../../operations/CAPACITY-LEDGER.md), [Phase 15
assurance](../../evidence/phase-15/15.6-assurance-rollout.md), [Phase 16
assurance](../../evidence/phase-16/16.8-assurance-capacity/VERIFICATION.md),
and [Phase 17 assurance](../../evidence/phase-17/17.8-capacity-rollout/VERIFICATION.md).

## Capability decision record

| Candidate                     | Problem baseline                                                                               | Target / success metric                                                                  | Recurring-cost ceiling             | Risk and privacy assessment                                                                         | Rollback                                                     | Decision       |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------- |
| Analytics/read store          | No PostgreSQL reporting bottleneck measured.                                                   | Define only after p95 query latency or reporting workload crosses an approved threshold. | $0 until separately approved.      | New copy of data would require lineage, retention, deletion propagation and authorization controls. | Retain PostgreSQL canonical reads; disable derived consumer. | Not activated. |
| Search evolution              | No relevance or zero-result baseline.                                                          | Measured improvement against a consented, authorization-filtered evaluation set.         | $0 until separately approved.      | Index must preserve authorization and deletion propagation.                                         | Keep PostgreSQL search.                                      | Not activated. |
| Marketing/workflow automation | No repetitive work or consented campaign economics measured.                                   | Bounded staff-time or conversion improvement with audit and approval checks.             | $0 until separately approved.      | Consent, frequency, unsubscribe, high-impact approval and audit constraints.                        | Disable workflow/campaign route; preserve CRM truth.         | Not activated. |
| AI assistance                 | No task dataset, evaluation threshold, owner, privacy assessment, or justified operating cost. | Task-specific quality threshold with human review and kill switch.                       | $0; no model provider is approved. | Prompt/data handling and generated-output safety are unproven.                                      | Disable feature flag; retain deterministic workflow.         | Not activated. |
| Public developer platform     | No external-integrator demand or stable public compatibility commitment.                       | Adoption and support-cost target after a sandbox/threat model is approved.               | $0 until separately approved.      | Credentials, quotas, abuse and version/deprecation policies required.                               | Keep internal Phase 17 contracts private.                    | Not activated. |
| Regional/reliability scale    | No measured latency, availability, residency or recovery shortfall.                            | Approved availability/recovery or residency target plus failover/failback drill.         | $0 until separately approved.      | Data ownership and consistency risks require a regional design.                                     | Continue the validated single-region path.                   | Not activated. |

## What would reopen this gate

Collect a meaningful production window without introducing any new feature:

1. Capture timestamped host/database capacity, query latency, queue lag,
   traffic and infrastructure cost using the existing operational controls.
2. Capture consented, aggregate search, lead, support, portal and integration
   demand/failure metrics without adding personal data to the telemetry stream.
3. Identify one material bottleneck and name the affected users and current
   operational cost.
4. Create `docs/execution/phase-18/<capability>/PLAN.md` and numbered steps
   only after the evidence names a target metric, owner, cost ceiling,
   capacity delta, privacy/security assessment and reversible rollback.
5. Obtain an explicit approval for that individual child capability before
   implementation.

Until then, the simpler production baseline remains the approved and safer
path. No Phase 18 schema, API, external service, or infrastructure change is
authorized by this memo.
