# Execution Decomposition Standard

This standard turns a roadmap phase into work that a fresh human or AI implementation agent can execute safely. A phase file defines outcomes and boundaries; it is not authorization to implement an entire multi-domain phase in one change.

## Mandatory pre-execution gate

Before any phase begins, create `docs/execution/phase-NN/PLAN.md` and numbered step files under `docs/execution/phase-NN/steps/`. No implementation branch opens until the phase plan passes goal-backward review.

Each step file must contain:

```text
Step ID and outcome
Source decision file numbers
Required predecessor step IDs
Exact input artifacts
Exact owned directories/modules/files
Explicit prohibited write areas
Output artifacts and migrations
API/event/schema compatibility impact
Implementation actions
Verification commands
Evidence output path
Security/privacy/tenant checks
Current and projected resource use
External-platform cost delta
Rollback point
Merge order and contract version
```

## Write ownership

- One active owner per writable module or schema.
- Parallel lanes may share read-only inputs but may not share unfrozen contract writes.
- Changes to authorization, canonical event envelopes, customer identity, billing truth, tenancy routing or shared document schemas are serialized.
- A contract producer merges first; consumers implement against the frozen version.

## Capacity gate

Every phase records current and projected CPU, memory, disk, disk I/O, database connections, backup volume and telemetry retention in `docs/operations/CAPACITY-LEDGER.md`. A claim of “$0 additional cost” is valid only when measurements demonstrate safe headroom. The plan must name degradation controls, the scale trigger, the next topology and its monthly cost.

## Evidence convention

Evidence is stored under `docs/evidence/phase-NN/<step-id>/` and links to test output, screenshots where relevant, migration rehearsal results, security/privacy checks, cost calculations and rollback verification. Secrets and personal data must never appear in evidence artifacts.

## Late-phase requirement

Phases 13–17 must be decomposed work-package by work-package using this standard after the repository structure is known and before their execution. Phase 18 is a portfolio gate: each approved capability becomes its own child phase with a separate plan, budget, evidence memo and rollback path.

## Portal contract-freeze gate

Before Phases 15 and 16 run in parallel, create and approve `docs/architecture/PORTAL-SHARED-CONTRACTS.md`. It freezes organization/customer identity, invoices/payments, files, support, notifications, audit events and client-visibility rules. Shared-contract changes merge through a dedicated serial lane; portal application lanes consume them without modifying them concurrently.

