# Identity Backup and Restore Runbook

## Purpose and authority

This runbook defines the backup cadence and restore procedure for the identity
platform (self-hosted Keycloak, per `docs/decisions/ADR-IDENTITY-PLATFORM.md`).
It is subordinate to `docs/operations/RESTORE-ORDER.md`; identity recovery
corresponds to step 5 of that order. Backup coverage follows
`docs/decisions/ADR-BACKUP-FAILURE-DOMAIN.md`: copies must be encrypted,
database-consistent and stored outside the primary failure domain.

Use this runbook for a corrupted realm, failed Keycloak upgrade, lost identity
database or rehearsed Phase 11B restore drill. Do not use it to improvise
realm configuration changes; those go through version-controlled realm export
files.

## What must be backed up

| Artifact                        | Source                                                                                            | Notes                                                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Realm JSON export               | Keycloak export of realm `stack-and-scale`                                                        | Contains clients (`web`, `api`, future `portal`, `account`), roles, MFA/recovery policy. No secrets in files; user credentials are not exported by default |
| Identity database schema        | PostgreSQL dump scoped to `identity.*` tables plus the `platform.organizations` placement columns | The identity provider's own database (when Postgres-backed) is dumped with it                                                                              |
| Provider-to-internal ID mapping | `platform.users` rows mapping internal IDs to provider `sub` claims                               | Critical: preserves memberships across any provider rollback                                                                                               |

Never store credentials, client secrets or admin passwords in backups,
exports or evidence records.

## Backup cadence

1. Export the realm JSON after every intentional realm change; commit it to
   the repository as the reviewed source of truth when appropriate.
2. Include the identity database in the daily PostgreSQL base-backup schedule
   described in the capacity ledger; rely on WAL/point-in-time logs where
   adopted.
3. Replicate each protected copy to the geographically separate backup target
   under independent credentials per the backup failure-domain ADR.
4. Record timestamp, backup size and verification outcome for every copy.
   Automated node backups are convenience only and never the sole control.

RPO/RTO targets are accepted in Phase 03 and measured in Phases 10B/11B;
record actuals here during drills until final targets are published.

## Restore procedure

1. Declare the incident or drill; follow steps 1–4 of
   `docs/operations/RESTORE-ORDER.md` so infrastructure, networking and the
   application database exist before identity is restored.
2. Restore the identity database into an isolated environment from a
   consistent backup; do not restore over a live production database.
3. Import the realm JSON into a clean Keycloak instance using
   `--import-realm` (it imports only when the realm does not already exist).
   Verify the imported clients enforce PKCE S256 as configured.
4. Validate staff access, MFA enrollment and session revocation through the
   admin console before opening privileged applications.
5. Verify the restored data:
   - Row counts for `identity.*` tables match pre-incident counts within the
     expected RPO gap.
   - Every restored provider `sub` claim joins to exactly one existing
     `platform.users` row; no orphaned or duplicated mappings.
   - `platform.organizations` placement columns are intact and consistent
     with restored memberships.
6. Invalidate all sessions after cutover: revoke active sessions/tokens so
   pre-incident access tokens issued against lost state cannot be replayed.
7. Resume traffic only after incident-owner approval per step 10 of the
   restore order; record actual RPO/RTO, data gaps and follow-ups.

## Rollback rule

Internal user IDs and memberships live in `platform.*`, keyed by stable IDs
mapped from the provider `sub` claim — never from provider-side identifiers
alone. A rollback of the identity provider to an earlier realm export or
database snapshot therefore preserves users, organization membership and
authorization, because application authorization reads our own database, not
the provider. Never re-provision users on provider rollback; remap instead.

## Verification command sketch

Adapt connection details to the target environment; run rehearsals against
isolated synthetic data only.

```sh
docker compose -f infra/compose.yaml exec -T postgres \
  psql -v ON_ERROR_STOP=1 -U stack_and_scale -d stack_and_scale \
  -c "SELECT count(*) FROM platform.users;"
```

Extend this list with exact row-count queries for each `identity.*` table and
the external_subject join-integrity check once the production schema is
finalized in Phase 10B; record them here as part of drill evidence.

## Prohibited actions

- Restoring identity data over a live production database.
- Storing credentials, client secrets or personal data exports in backup
  evidence.
- Re-provisioning users on provider rollback instead of preserving the
  internal ID mapping.
- Skipping session invalidation after any restore.
- Treating automated node backups as the sole disaster-recovery control.

## Phase exit gate

Phase 05 exits with this runbook in place. Phases 10B and 11B must rehearse
this procedure end to end, fill in exact commands, measure RPO/RTO and attach
evidence before V1 launch, per `docs/operations/RESTORE-ORDER.md`.
