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

## Verification

- API: 109 tests passed, 3 environment-gated tests skipped.
- Workers: 14 tests passed.
- Contracts: 52 tests passed.
- Storage: 7 tests passed.
- Lint, typecheck, builds, formatting and migration checks passed.

## Production smoke

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

No provider, tax rule, qualified signature or payment settlement is claimed by
the local implementation until these gates have evidence.
