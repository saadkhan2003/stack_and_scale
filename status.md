# Stack & Scale Project Status

Last updated: 2026-08-27

This is the cold-start handoff. Read it before changing implementation.

## Current position

Phases 00–10 are implemented locally. An OVH VPS-2 production host was
provisioned and baseline-hardened on 2026-08-27; it has no application or
public traffic yet. Phase 11 local implementation is complete and the Phase 12
launch trace is documented. Production and external release gates are
intentionally not represented as complete.

Latest Phase 09 commits:

- `b19556f` — lead intake, booking, CRM and email workflows
- `377d004` — staff CRM workspace and opportunities/pipelines
- `e1558be` — browser coverage for the lead/demo form
- `31c60c2` — explicit Playwright test runner dependency

## Phase audit: 00–10

| Phase | Status                             | Still remaining                                                                                                                                                                                                                                                                          |
| ----- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 00    | Complete                           | Nothing in Phase 00. Documentation gate passed.                                                                                                                                                                                                                                          |
| 01    | Mostly complete                    | Re-run clean-clone/bootstrap and CI verification after dependency-link repair; no dedicated Phase 01 verification record is present.                                                                                                                                                     |
| 02    | Locally complete                   | Source SVG/transparent icon brand assets and visual-regression snapshots when final content stabilizes.                                                                                                                                                                                  |
| 03    | Complete as architecture/contracts | Runtime enforcement of all threat-model controls belongs to later infrastructure/security phases.                                                                                                                                                                                        |
| 04    | Local complete                     | Production backups, secrets, monitoring, incident and recovery drills remain for Phases 10–11.                                                                                                                                                                                           |
| 05    | Near-complete/local                | Real Keycloak live E2E is opt-in; recovery email delivery is verified locally, but final password-reset submission was intentionally not browser-completed. Production IdP configuration and backup drills remain.                                                                       |
| 06    | Local complete                     | CMS is verified locally. Production CMS deployment, secrets and operational ownership remain later work.                                                                                                                                                                                 |
| 07    | Local complete                     | Production legal/privacy wording, real data practices, processors, retention details and real production-performance verification remain launch blockers.                                                                                                                                |
| 08    | Local complete                     | Configure production URL, Search Console ownership, sitemap submission, index monitoring, analytics processor/retention and approved legal wording.                                                                                                                                      |
| 09    | Local complete                     | Configure production CRM organization/memberships, demo slots, transactional email and DNS; then verify live staff OIDC access and real email delivery.                                                                                                                                  |
| 10    | OVH host provisioned; app pending  | Host SSH/Docker/UFW baseline, Cloudflare-only origin access and protected CI deployment secrets are configured. Rename the GitHub repository to lowercase, generate server-local application secrets, deploy the application, verify the internal database has no public port, then rehearse deployment/rollback, browser edge behavior, capacity and independent-backup restoration. |
| 11    | Local implementation complete      | See `docs/evidence/phase-11/VERIFICATION.md`. Live alert routing, external uptime/status, independently protected backup storage, named owners and full restore exercises remain launch-blocking external gates.                                                                         |
| 12    | Local launch trace complete        | Production journey, performance, legal, privacy, monitoring, rollback and restore evidence remains blocked by external setup. Use `docs/evidence/phase-12/LAUNCH-TRACE.md` as the execution record.                                                                                      |

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

Latest local verification:

- API: 67 passed, 3 intentionally skipped.
- Workers, contracts and database suites: passed.
- Fresh production web build: passed; includes `/staff/leads` and CRM proxy
  routes.
- Chromium browser suite: 5 passed, including consent and progressive demo
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
- Do not overwrite or commit `apps/public/` without user review: it is
  untracked, user-owned content.
- Use the Data-partition dependency/cache setup before installs:
  `source scripts/development-environment.sh`.

## Next recommended work

Complete the Phase 10–11 external gates and the Phase 12 production journey
tests recorded in the evidence files. Then complete the Phase 12 launch review.
