# ADR — Backup Failure-Domain Separation

**Status:** Accepted for Phase 00; final provider/location is selected in Phase 10B.

## Context

One server copy and provider-local convenience backup do not satisfy the approved recovery requirement. A primary account compromise, location failure or deletion event must not remove the only recoverable copy.

## Decision

Maintain encrypted, database-consistent recovery copies outside the primary Hetzner location and failure domain. The backup target uses independent credentials or account separation, limited delete authority and practical immutability/versioning where supported. The final provider must fit the budget and pass export/restore testing.

## Required coverage

- PostgreSQL base backups and point-in-time logs where adopted;
- identity data;
- CMS and application configuration;
- media/files and their metadata;
- IaC state, monitoring/status configuration;
- protected recovery-key material handled under the secrets ADR.

## Consequences

- Automated node backups remain useful but are not the sole disaster-recovery control.
- Phase 11B must restore a complete system using `docs/operations/RESTORE-ORDER.md` and measure RPO/RTO.
- No production launch is permitted without evidence that primary credentials cannot silently erase the protected recovery copy.

