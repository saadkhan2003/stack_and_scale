# 00-01 — Authority, Scope and Traceability

## Outcome

Create the authoritative requirement boundary and individually auditable decision trace for all 100 locked decisions.

## Inputs

- `STACK_AND_SCALE_PLATFORM_BLUEPRINT_V1.md`
- `question-decisions/001-*.md` through `100-*.md`
- `plans/MASTER_IMPLEMENTATION_PLAN.md`
- `plans/phase-00-program-constitution.md`

## Ownership and prohibited writes

- **Owns:** `docs/program/AUTHORITY.md`, `V1-SCOPE.md`, `REQUIREMENTS.md`, `DECISION-TRACEABILITY.md`.
- **Does not modify:** question-decision records, blueprint, phase plans, code, provider accounts or infrastructure.

## Actions and outputs

1. Record precedence and no-silent-change rules.
2. Define V1 included/deferred/prohibited capabilities.
3. Map Q001–Q100 individually to requirement, V1/deferred status, owner phase, source section and test family.

## Compatibility and cost

No schema/API/event impact. Cost delta: $0.

## Verification

- Count 100 decision rows.
- Confirm every V1 requirement has an owner and acceptance family.
- Confirm deferred features are not listed as V1 implementation.

## Evidence and rollback

Store results in `docs/evidence/phase-00/00-01/`. Roll back by reverting only the documentation change; preserve original decisions and record any correction in `PLAN-CHANGES.md`.

## Merge order

Merge before all other Phase 00 steps; it is the input contract for 00-02 through 00-05.

