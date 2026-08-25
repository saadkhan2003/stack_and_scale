# 00-04 — Secrets, Backup and Capacity Baseline

## Outcome

Choose a Phase 01 secrets workflow and establish a must-fit budget, plausible service allocation and recoverable failure-domain design.

## Inputs

- Outputs from 00-02 and 00-03
- Decisions Q026–Q027, Q048–Q053, Q079–Q082, Q097–Q100
- Current official provider pricing verified at purchase time

## Ownership and prohibited writes

- **Owns:** `docs/decisions/ADR-SECRETS-MANAGEMENT.md`, `ADR-BACKUP-FAILURE-DOMAIN.md`, `docs/operations/CAPACITY-LEDGER.md`, `RESTORE-ORDER.md` and budget-guardrail updates.
- **Does not modify:** cloud resources, real secrets, provider credentials, production backup targets or application code.

## Actions and outputs

1. Select SOPS+age constrained local-development baseline and document custodian/access/recovery controls.
2. Require geographic/credential failure-domain separation for backups.
3. Set a $46.90 maximum planned spend and $3.10 hard buffer beneath the $50 ceiling.
4. Allocate planned 16 GB app and 8 GB database resources, retention caps and degradation/scale triggers.
5. Define complete-system restore order.

## Compatibility and cost

No runtime impact and no purchase. Planned recurring maximum: $46.90/month; all figures are revalidated in Phase 10B before activation.

## Verification

- Budget arithmetic is at or below $50 including all reserve lines.
- Secrets policy separates local/staging/production and has recorded access/recovery rules.
- Capacity allocations fit planned nodes with explicit measurement/scale gate.
- Restore order includes database, identity, config, files, IaC, monitoring/status and key recovery.

## Evidence and rollback

Store results in `docs/evidence/phase-00/00-04/`. Revert documentation only; any provider/budget change is a plan change and ADR amendment.

## Merge order

Merge after 00-02 and 00-03, before 00-05. It is a mandatory input to Phase 01 and Phase 10B.

