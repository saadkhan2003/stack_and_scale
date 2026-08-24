# 01-03 — API and Worker Shells

## Outcome

Provide the minimal NestJS API health/version endpoints and worker no-op job boundary, driven by shared contracts and tests.

## Inputs

01-01/01-02 outputs; Q071–Q073, Q079 and Phase 04 boundary.

## Ownership

Own `apps/api`, `apps/workers`, `packages/contracts`. Do not create database domains/migrations, identity, queue provider or business endpoints.

## Actions

Write executable RED tests for health/version and a no-op job result, then implement shells to GREEN. Use deterministic ports/config and no secret values.

## Compatibility, cost and rollback

No persistent schema/event impact and $0 cost. Revert API/worker shells independently; retain contract tests as diagnosis.

## Verification and evidence

Run unit/API integration tests, typecheck, build and no-op worker test. Evidence: `docs/evidence/phase-01/01-03/`.

## Merge order

After 01-02; parallel with 01-04 only after shared contract version is frozen.

