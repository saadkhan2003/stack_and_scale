# WS09 — Identity backup and restore runbook

Goal: operational runbook satisfying Phase 05 exit criterion "identity
backup and restore procedure exists".

Owns: docs/operations/IDENTITY-BACKUP-RESTORE.md.

Requirements:

- Covers: Keycloak realm JSON export/import cadence, identity schema pg_dump
  scope (identity.\* tables + platform.organizations placement columns),
  restore order aligned with docs/operations/RESTORE-ORDER.md, verification
  steps (row counts, external_subject join integrity, session invalidation on
  restore), rollback rule that internal user IDs/memberships survive provider
  rollback, and RPO/RTO placeholders consistent with CAPACITY-LEDGER tone.
- Style: match existing docs/operations runbooks (headings, imperative steps,
  no secrets).
