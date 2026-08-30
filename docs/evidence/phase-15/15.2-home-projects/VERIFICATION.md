# Phase 15.2 Home And Projects Verification

## Scope

This slice adds only disabled-by-default portal-owned project and milestone
projections. It does not read or alter canonical Phase 14 commercial/support
tables, nor does it expose a client web route yet.

## Implemented boundary

- Migration `0021_phase_15_2_portal_project_projections.sql` adds independent
  `portal_home_enabled` and `portal_projects_enabled` flags, both defaulting to
  `false`.
- Project and milestone records are explicit portal projections, keyed to a
  client organization. They have no staff, pricing, storage-key, audit or
  canonical-record serialization path.
- A client administrator may query its organization projections. A client
  member requires an active, exact project grant. Cross-organization, unknown
  and ungranted project requests use the same generic denial response.
- Responses are allow-listed to title, approved scope summary, client-safe
  status, next action, published time and milestone label/status/date.

## Verification

- Portal contracts: 65 tests passed, including 6 project authorization cases.
- API typecheck passed.
- Prettier and `git diff --check` passed.
- Database-backed route tests cover active exact grants, ungranted denial and
  home summaries. They require PostgreSQL at `127.0.0.1:5433`; this Codex
  sandbox blocks that socket (`EPERM`), so they must be run in CI or the normal
  local Docker development environment before release.

## Rollout

Both new flags default to disabled. No customer organization has been enabled,
and disabling either projection feature does not delete or alter any canonical
record.
