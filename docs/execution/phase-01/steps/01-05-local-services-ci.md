# 01-05 — Local Services, CI and Phase Exit

## Outcome

Provide Docker-based local PostgreSQL/reset mechanics, root verification commands, CI configuration and Phase 01 evidence without provisioning remote infrastructure.

## Inputs

01-01 through 01-04 outputs; environment/delivery policy, capacity ledger and Q078–Q081.

## Ownership

Own local compose/reset documentation, CI files and Phase 01 evidence. Do not create cloud IaC, remote CI secrets, production databases or provider resources.

## Actions

Add deterministic local service config, health checks and non-sensitive fixture/reset workflow. Wire root commands for install, lint, typecheck, unit, integration, build and browser checks. Add CI workflow using lockfile/install cache and safe job conditions.

## Compatibility, cost and rollback

No production schema/API impact and $0 recurring cost. Revert local/CI files independently; no remote state exists.

## Verification and evidence

Run full root commands locally, exercise PostgreSQL start/reset/health, validate CI syntax where possible and document Node 24 revalidation status. Evidence: `docs/evidence/phase-01/01-05/`.

## Merge order

Final Phase 01 step after both application lanes are green.

