# Phase 15.4 Commercial And Files Verification

## Implemented boundary

- Commercial and file projections are disabled by default per client
  organization.
- Commercial DTOs include only client-safe labels, status, currency, totals,
  dates, payment instructions and receipt availability. They never include
  reconciliation, provider, audit, staff or tax-configuration fields.
- File DTOs return only clean, explicitly project-granted metadata. Storage
  keys, checksums, classifications, scanner details and retention/legal-hold
  fields are never selected.
- Neither route initiates, verifies, reconciles or reverses a payment, and
  neither one issues a file URL while the separate approved storage capability
  is not enabled.

## Verification

- API typecheck passed.
- SQL is additive and all client flags default to `false`.
- Route integration and signed-capability evidence remain required before any
  organization is enabled; they depend on the normal PostgreSQL test runner and
  approved Phase 14 private-storage configuration.
