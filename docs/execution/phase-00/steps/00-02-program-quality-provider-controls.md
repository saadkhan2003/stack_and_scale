# 00-02 — Program, Quality and Provider Controls

## Outcome

Define truthful content handling, provider selection controls, risks, quality gates and environment/delivery rules.

## Inputs

- Outputs from 00-01
- `plans/BUDGET_GUARDRAILS.md`
- Decisions Q007, Q026–Q027, Q061–Q062, Q068, Q078–Q081 and Q099–Q100

## Ownership and prohibited writes

- **Owns:** `docs/program/CONTENT-INVENTORY.md`, `PROVIDER-DECISIONS.md`, `QUALITY-GATES.md`, `RISK-REGISTER.md`, `PLAN-CHANGES.md`, `ENVIRONMENT-AND-DELIVERY-POLICY.md`.
- **Does not modify:** provider configuration/accounts, secrets, production content, code or infrastructure.

## Actions and outputs

1. Record asset/proof gaps without inventing content.
2. Define provider decision gates and prohibited purchases.
3. Establish release-blocking severity/quality rules and environment isolation/promotion policy.
4. Record operational risks, owners, triggers and contingencies.

## Compatibility and cost

No runtime impact. Cost delta: $0; planned provider envelope remains capped by the budget guardrails.

## Verification

- Confirm every future provider has owner, decision gate and cancellation/export rule.
- Confirm production data/secrets are prohibited outside production.
- Confirm all V1 launch blockers are present.

## Evidence and rollback

Store results in `docs/evidence/phase-00/00-02/`. Revert documentation only; changes to a selected baseline use `PLAN-CHANGES.md` and an ADR where relevant.

## Merge order

Merge after 00-01 and before 00-04; its environment and provider rules are inputs to secrets, backup and capacity decisions.

