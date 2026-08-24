# 01-02 — Shared Configuration and Testing

## Outcome

Create strict shared TypeScript, lint/format configuration and test utilities that can prove small contract behavior before application shells exist.

## Inputs

01-01 outputs; Q074, Q075, Q078–Q080; quality gates.

## Ownership

Own `packages/config`, `packages/testing`, root test configuration and their tests. Do not write app shells, database schema or infrastructure.

## Actions

Write and execute RED tests for shared health/version contract helpers, then implement the smallest utilities/configuration to make them GREEN. Configure coverage/reporting without claiming a repository-wide percentage until applications exist.

## Compatibility, cost and rollback

No API/schema impact and $0 cost. Revert packages/config/testing independently if tooling proves incompatible.

## Verification and evidence

Run the relevant RED test, GREEN test, lint, typecheck and coverage for owned packages. Evidence: `docs/evidence/phase-01/01-02/`.

## Merge order

After 01-01; before application shells.

