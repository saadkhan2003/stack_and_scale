# Phase 15.1 Portal Access Verification

## Scope

This slice adds the disabled-by-default portal access boundary only. It does not
expose customer, project, commercial, support, file, activity or notification
records.

## Verification

- Portal authorization contract: 7 tests passed.
- Portal API integration: 5 tests passed against PostgreSQL and migration
  `0020_phase_15_1_portal_access.sql`.
- API typecheck and Prettier checks passed.
- The endpoint returns only `clientOrganizationId` and `role` for an active
  member of an enabled client organization.
- Anonymous callers receive 401. Unknown identifiers, disabled organizations
  and inactive/foreign memberships receive the same 403 envelope without
  exposing record existence.

## Rollout

`portal.client_organizations.portal_access_enabled` defaults to `false`. No
production organization has been enabled by this change. Removing portal access
is a flag update; canonical Phase 14 records are not changed or deleted.
