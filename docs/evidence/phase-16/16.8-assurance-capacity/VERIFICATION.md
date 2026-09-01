# Phase 16.8 — production assurance and capacity verification

## Delivered control plane

Phase 16 introduces a product-customer account domain that is separate from
the Phase 15 custom-development portal. It includes product catalogue and
organization ownership, subscription events, deterministic entitlement
snapshots, license installations and replay-resistant leases, bounded billing
and support projections, release metadata/download audit, and per-user
notification preferences. Product-account access is explicit, active
membership only, and organization-scoped.

The final immutable production delivery for runtime commit
`55056c8` completed successfully in run `33428884948` on 2026-09-01. It ran
the database migrations, full API test suite, web build, image builds,
critical/high image scans, protected-environment promotion, and deployment
health checks. The final assurance commit `e0f5895` then passed the same
protected delivery in run `33431436813`, including production promotion and
health checks.

## Isolated production QA

All production mutations used the protected
`.github/workflows/phase16-rollout-assurance.yml` workflow and the synthetic
`phase16-qa-*` records only:

- Run `33426858045` seeded an enabled QA product, product account, active
  subscription, license and installation for the existing QA identity.
- The authenticated browser rendered the product-account page for
  `phase16-qa-account`, including its active subscription, active one-seat
  license and notification preferences. No releases or support records were
  exposed because none were seeded.
- Run `33429986002` disabled only that account. A browser refresh returned the
  generic product-account authorization boundary. The staff lead workspace
  continued to render, showing that the account flag did not disable staff
  routes.
- Run `33430048423` re-enabled only that account. The same authenticated browser
  session immediately recovered its product-account view.

The browser QA did not create customer records, publish a release, issue a
download capability, alter payment truth, or expose a signing key or storage
credential.

## Capacity and rollback evidence

- Run `33430841242` completed the protected production capacity capture after
  the Phase 16 release. Raw host measurements remain on the protected host;
  they are intentionally not copied to source control.
- The account-flag disable/enable drill above is the controlled rollback and
  recovery mechanism. It is independently scoped from Phase 15 portal flags.

## Automated verification

- PostgreSQL-backed product-account integration tests cover organization
  isolation, every documented subscription transition, idempotency, signed
  entitlement snapshots, signing-key revocation, stale installation lease
  replay rejection, bounded billing/support projections, notification
  preferences, and release-download auditing.
- The focused suite passed 7/7 tests locally during final verification; API
  typecheck/lint and web typecheck/lint passed, and the web suite passed 31/31.
- The immutable delivery run completed the repository API test suite and web
  production build before promotion.
- All four container images passed the delivery workflow's critical/high
  vulnerability scan gates.

## Scope retained for later phases

This release intentionally returns `null` for a download capability until
private object storage, malware scanning and short-lived signed URLs are
separately configured and verified. The account control plane therefore never
creates permanent public download URLs or stores signing-key secrets.
