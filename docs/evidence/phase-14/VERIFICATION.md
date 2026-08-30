# Phase 14 Verification

## Current verdict

Phase 14 local foundations are implemented and verified through the provider
boundaries. The phase is not exit-ready until its legal, provider, storage and
operational gates are resolved.

## Implemented locally

- Minor-unit money, explicit ISO currency, deterministic rounding, configured
  tax/discount calculation, numbering and state transitions.
- Tenant-scoped proposals with immutable versions, approvals, publication,
  public viewing and acceptance evidence.
- Contract templates/versions, proposal-version binding, signer evidence, HMAC
  callback authenticity/idempotency, retries, deterministic PDF artifacts and
  artifact metadata fallback.
- Invoice lifecycle, five explicit local payment methods, pending verification,
  duplicate proof/reference detection, allocation, reversal, refund and receipt
  records.
- Deterministic accounting exports and import/mapping ledgers.
- Support tickets, public/internal comments, SLA pause clocks, escalation and
  attachment metadata.
- Private file metadata, versions, quotas, scan states, signed-access hooks and
  download audits, transactional quota reservation, legal holds, expiry,
  quarantine, restore and compensation cleanup.
- Idempotent resumable provisioning with approval gates and worker execution.
- Template-controlled commercial communications, preferences, delivery state and
  resend auditing.
- Private self-hosted infrastructure definitions for MinIO S3-compatible
  storage, ClamAV scanning, API adapter selection, secret-file wiring and a
  disabled Documenso profile. This is manifest and unit-test evidence only;
  no storage, scanner, e-sign or provider deployment has been performed.

## Verification

- API: 109 tests passed, 3 environment-gated tests skipped.
- Workers: 14 tests passed.
- Contracts: 52 tests passed.
- Storage: 7 tests passed.
- Lint, typecheck, builds, formatting and migration checks passed.

## Production smoke

- Immutable delivery run `33319034757` completed successfully for release
  `b34505d71d95a2adbb450fc5b26c68113f87cc82` after the API runtime-image
  dependency fix.
- Browser verification on 2026-08-30 confirmed the production homepage and
  staff sign-in screen render without console or network errors; API readiness
  reports application, database, migrations, outbox and privacy checks up; CMS
  login renders; and unauthenticated invoice, support and private-file endpoints
  reject access.
- Local re-verification against PostgreSQL: API 113 passed (3 live-Keycloak
  tests intentionally skipped), contracts 52 passed, storage 9 passed and
  workers 14 passed.
- Phase 14 infrastructure Compose verification: 3 passed, covering valid YAML,
  absence of storage host ports, opt-in-only secret mounts and inactive ordinary
  production provider defaults.
- Local Browser MCP verification used the isolated Keycloak fixture only: a
  real OIDC sign-in reached the authenticated commercial workspace and proposal
  empty state; a confirmed identity-provider logout returned to the local site.
  The fixture's temporary manager role and membership were restored afterward.
- The browser run corrected the local development callback origin in
  `scripts/dev.sh`; the focused OIDC flow suite passed 8 tests after adding the
  client identifier required by Keycloak's end-session request.
- Immutable delivery run `33304916000` completed successfully.
- Production release `008c7f72a0682080d1af3b81e781755cb40b31c2` is running on
  OVH; migrations `0010` through `0019` applied successfully.
- Website, API readiness and CMS login endpoints returned `200`.
- Unauthenticated invoice and support endpoints returned `401`.
- API, web, CMS, workers, PostgreSQL, Keycloak, Prometheus, Grafana and
  Alertmanager are running; disk usage was 30% at verification.

## Open exit gates

1. Select and legally approve an e-sign provider; complete its adapter,
   callbacks, signed artifact export and retention proof. The provider-neutral
   boundary and local fallback are implemented.
2. Apply branding and store/retrieve canonical PDFs through production private
   object storage.
3. Configure real S3-compatible storage and malware scanning, then verify
   quotas, retention, restore references and signed-download expiry.
4. Run all five payment methods through authorized verification,
   reconciliation, allocation, reversal and receipt scenarios.
5. Link accepted proposal/payment outcomes to a real customer/project account.
6. Measure PDF, file, support, payment, e-sign and communications workloads and
   update the capacity ledger with approved costs/caps.
7. Complete the self-hosted lane activation runbook, including DNS/operator,
   legal/provider, backup and capacity gates in
   `docs/operations/PHASE-14-SELF-HOSTED-INFRASTRUCTURE.md`.

No provider, tax rule, qualified signature or payment settlement is claimed by
the local implementation until these gates have evidence.
