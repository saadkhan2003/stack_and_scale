# Stack & Scale Project Status

Last updated: 2026-08-29

This is the cold-start handoff. Read it before changing implementation.

## Current position

Phases 00–11 are implemented locally. An OVH VPS-2 production host, Namecheap
domain and Cloudflare zone are live. Immutable production delivery now passes
for the current release, including all four image security gates, migrations,
service promotion and live edge checks. Phase 11 observability, independent
backup/recovery and operational alert gates remain intentionally incomplete
until their external evidence is recorded.

Latest Phase 09 commits:

- `b19556f` — lead intake, booking, CRM and email workflows
- `377d004` — staff CRM workspace and opportunities/pipelines
- `e1558be` — browser coverage for the lead/demo form
- `31c60c2` — explicit Playwright test runner dependency

## Phase audit: 00–12

| Phase | Status                                           | Still remaining                                                                                                                                                                                                                                                                                 |
| ----- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 00    | Complete                                         | Nothing in Phase 00. Documentation gate passed.                                                                                                                                                                                                                                                 |
| 01    | Local complete                                   | The Phase 01 verification record exists and the current workspace passes the full lint, typecheck and unit-test sweep. A networked clean-clone bootstrap remains useful release evidence, but is not a Phase 01 implementation gap.                                                             |
| 02    | Locally complete                                 | Source SVG/transparent icon brand assets and visual-regression snapshots when final content stabilizes.                                                                                                                                                                                         |
| 03    | Complete as architecture/contracts               | Runtime enforcement of all threat-model controls belongs to later infrastructure/security phases.                                                                                                                                                                                               |
| 04    | Local complete                                   | Production backups, secrets, monitoring, incident and recovery drills remain for Phases 10–11.                                                                                                                                                                                                  |
| 05    | Near-complete/local                              | Real Keycloak live E2E is opt-in; recovery email delivery is verified locally, but final password-reset submission was intentionally not browser-completed. Production IdP configuration and backup drills remain.                                                                              |
| 06    | Local complete                                   | CMS is verified locally. Production CMS deployment, secrets and operational ownership remain later work.                                                                                                                                                                                        |
| 07    | Local complete                                   | Production legal/privacy wording, real data practices, processors, retention details and real production-performance verification remain launch blockers.                                                                                                                                       |
| 08    | Local complete                                   | Configure production URL, Search Console ownership, sitemap submission, index monitoring, analytics processor/retention and approved legal wording.                                                                                                                                             |
| 09    | Local complete                                   | Configure production CRM organization/memberships, demo slots, transactional email and DNS; then verify live staff OIDC access and real email delivery.                                                                                                                                         |
| 10    | Live deployment verified; operational gates open | Host SSH/Docker/UFW baseline, Cloudflare-only origin access, Cloudflare Origin Certificate, protected server environment, live services and immutable promotion are verified. Remaining: Full (strict) evidence, public-database denial, rollback, capacity and independent-backup restoration. |
| 11    | Local implementation complete                    | See `docs/evidence/phase-11/VERIFICATION.md`. Live alert routing, external uptime/status, independently protected backup storage, named owners and full restore exercises remain launch-blocking external gates.                                                                                |
| 12    | Launch trace active; not approved                | Immutable production release and core health/OIDC/edge checks pass. Production journeys, performance, legal, privacy, monitoring, rollback and restore evidence remain open. Use `docs/evidence/phase-12/LAUNCH-TRACE.md` as the execution record.                                              |

## Phase 09: implemented and locally verified

- Public product-demo, custom-project and general-contact intents; progressive
  demo fields, consent/privacy acknowledgement, honeypot, validation and rate
  limiting.
- Attributed, idempotent lead intake with audit/outbox records.
- Configurable demo-slot selection, timezone storage, collision prevention and
  alternate-time requests.
- Non-sensitive, attributed WhatsApp handoff.
- CRM leads, distinct opportunities, pipeline templates, ownership, stages,
  value, probability, next action, lost reason, notes, tasks and activities.
- Session-protected staff inbox at `/staff/leads` with lead detail and updates.
- Development email capture, durable outbox delivery, free-tier production
  adapter documentation and SPF/DKIM/DMARC instructions.

Latest local verification (2026-08-28):

- Full workspace lint and TypeScript checks: passed.
- Unit suites: contracts 38, database 30, storage 4, UI 3, API 70, workers 7
  and web 14 — **166 passed**. Three API Keycloak-live E2E tests are explicitly
  skipped because they require a separately configured live identity provider.
- Fresh production web build: passed; includes `/staff/leads` and CRM proxy
  routes.
- Chromium browser suite: **5 passed**, including consent and progressive demo
  controls.

### Required Phase 09 production configuration

Set and verify:

- `CRM_ORGANIZATION_ID`
- active Identity/Keycloak memberships with `manager`, `admin` or `owner` role
- `DEMO_AVAILABLE_SLOTS`
- `RESEND_API_KEY`, `TRANSACTIONAL_EMAIL_FROM` and `CRM_NOTIFICATION_EMAIL`
- sender-domain SPF, DKIM and DMARC records

CMS authentication does not automatically grant CRM access. The staff CRM
requires a configured Identity/Keycloak membership in `CRM_ORGANIZATION_ID`.

## Owner inputs and external gates still needed

These are not source-code tasks. Do not send passwords, API keys, private keys
or certificate contents in chat or commit them to Git. Provide only the
decision, account setup confirmation or non-secret identifier requested.

| Area               | What the owner must provide or configure                                                                                                                             | Why it is required                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Production release | Wait for CI on the latest `main` commit to pass, then run the immutable delivery workflow once against `production` and approve the protected environment            | Deploys the reviewed current release and runs migrations/health checks        |
| Cloudflare         | Confirm SSL/TLS encryption mode is **Full (strict)**                                                                                                                 | Makes the Cloudflare Origin Certificate validation real rather than assumed   |
| Outbound email     | Create a Resend account (or choose an equivalent provider), verify a sender domain/address, then provide the non-secret sender address and configure its DNS records | Enables Keycloak password recovery plus CRM/lead email delivery               |
| CRM operations     | Provide the Keycloak organization ID, create staff memberships/roles, and decide initial demo-slot times                                                             | Enables the staff CRM and real demo booking                                   |
| Backups            | Choose a geographically separate Restic-compatible backup provider/account and create independent credentials outside OVH                                            | Required for encrypted off-server backups and an isolated restore rehearsal   |
| Monitoring/alerts  | Confirm the named alert recipient and create the independent uptime-check account; later create metrics/Grafana secrets only on the server                           | Enables actionable outage, resource and backup alerts                         |
| Secret governance  | Name a second trusted secret custodian and record the appointment/review dates in `docs/security/SECRET-CUSTODIANS.md`                                               | One person alone is not sufficient for recovery-key control                   |
| Legal/privacy      | Supply approved legal business identity, contact route, data practices, processor/DPA decisions and retention periods                                                | Required before public collection of production personal data can be approved |
| Search/analytics   | Verify Search Console ownership and submit the sitemap; keep analytics disabled unless an approved processor and retention policy are selected                       | Completes search and consent/analytics launch requirements                    |
| Staging/recovery   | Authorize an isolated, disposable staging environment and its provider/account before the rollback and restore drill                                                 | A production host must not be used as the staging or restore target           |

## Authoritative evidence and caveats

- `docs/evidence/phase-00/00-05/VERIFICATION.md`
- `docs/evidence/phase-02/VERIFICATION.md`
- `docs/evidence/phase-03/VERIFICATION.md`
- `docs/evidence/phase-04/VERIFICATION.md`
- `docs/evidence/phase-05/VERIFICATION.md`
- `docs/evidence/phase-06/VERIFICATION.md`
- `docs/evidence/phase-07/VERIFICATION.md`
- `docs/evidence/phase-08/VERIFICATION.md`
- `docs/operations/transactional-email.md`
- `docs/evidence/phase-10/VERIFICATION.md`
- `docs/evidence/phase-11/VERIFICATION.md`
- `docs/evidence/phase-12/LAUNCH-TRACE.md`
- `docs/operations/PHASE-10-DELIVERY.md`
- `docs/decisions/ADR-PHASE-10-SINGLE-SERVER-TOPOLOGY.md` — current
  cost-first one-server decision and the exact two-server restoration guide.
- `docs/decisions/ADR-PHASE-10-OVH-VPS-PRODUCTION-HOST.md` — actual
  OVHcloud production-host decision and migration/rollback guidance.

## Workspace notes

- Current branch: `main`.
- `apps/public/` is now versioned; review new public assets before committing
  further changes.
- Use the Data-partition dependency/cache setup before installs:
  `source scripts/development-environment.sh`.

## Next recommended work

Complete the Phase 10–11 external gates and the Phase 12 production journey
tests recorded in the evidence files. Phase 13 must wait for a recorded Phase
12 launch review.
