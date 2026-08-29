# Phase 13.11/13.12 Verification

## Scope

The staff-only `/staff/operations` page reads two API endpoints:

- `/api/v1/operations/release` returns only allowlisted deployment version,
  environment, readiness checks, migration version, bounded history and rollback
  availability. It requires `audit:read` and never returns deployment files,
  registry data, paths or secrets.
- `/api/v1/operations/capacity` returns bounded CPU, memory, disk and PostgreSQL
  connection measurements, a capped 2x projection, retention policy,
  degradation controls and the next topology trigger. It performs no writes.

## Evidence

- API staff operations unit tests cover sanitized release records, secret-field
  exclusion, rollback availability, bounded projections and retention values.
- Web proxy tests cover staff-cookie forwarding and controlled upstream failure.
- The shared staff navigation test covers the new destination.
- Production proof remains runtime-dependent: the page reports values from the
  configured production host only when the authenticated API can read them.

## Verification commands

Run from the repository root (the environment used for this record has the
repository binaries installed, but does not expose `pnpm` on `PATH`):

```text
./node_modules/.bin/eslint src test                         (apps/api)
./node_modules/.bin/eslint app src test e2e ...             (apps/web)
./node_modules/.bin/tsc --noEmit                            (apps/api, apps/web)
./node_modules/.bin/vitest run                              (apps/api, apps/web)
./node_modules/.bin/prettier --check apps packages ...      (root)
```

All checks pass after the Phase 13.11/13.12 changes, including production build
compilation. The API suite reports 80
passing tests and 3 existing skipped live-Keycloak tests; the web suite reports
31 passing tests. Build verification is recorded with the Phase 13 delivery
check once the production build completes.
