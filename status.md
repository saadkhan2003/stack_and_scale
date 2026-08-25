# Stack & Scale Project Status

Last updated: 2026-08-25 11:15 PKT
Current branch: `master`
Current latest commit: `8f3a5bf docs: record Phase 04 verification pass`
Initial external-platform budget ceiling: USD 50/month

This file is the cold-start handoff for any future agent. Read this before
touching implementation.

## Project Goal

Build the Stack & Scale company platform in controlled execution phases:
public website, content/CMS, lead engine, CRM, infrastructure, operations,
staff tools, client portal, product account control plane, product integrations
and later intelligence/global scale.

Core choices already locked:

- PostgreSQL is the central transactional foundation.
- Backend starts as a modular NestJS monolith.
- Next.js powers the public web experience.
- Payload CMS is planned for structured content.
- Open-source/self-hosted options are preferred.
- External platform spend must initially stay at or below USD 50/month.
- No AI service is required for core operation.
- Privacy, security, accessibility, migrations, idempotency and recovery are
  release gates, not cleanup tasks.

## Current Completion Summary

Completed execution phases: 5 of 19

- Phase 00: complete as planning/program foundation, but many Phase 00 docs are
  currently untracked in Git.
- Phase 01: complete as repository/engineering foundation.
- Phase 02: complete and verified.
- Phase 03: complete and verified.
- Phase 04: complete and verified for local data/backend foundation.

Remaining execution phases: 14 of 19

- Phase 05 through Phase 18 are not implemented yet.
- The next implementation phase should be Phase 05: identity, tenancy and
  authorization.

## Phase Status Table

| Phase | Name                                             | Status                                              | Evidence                                                                                      | Main Remaining Work                                                                                                                                     |
| ----: | ------------------------------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    00 | Program constitution and readiness               | Complete, untracked evidence present                | `docs/execution/phase-00/`, `docs/evidence/phase-00/`, `docs/program/`, `question-decisions/` | Commit or intentionally archive the currently untracked Phase 00 planning files after review.                                                           |
|    01 | Repository and engineering foundation            | Complete                                            | App/package shells, local Postgres compose, scripts, shared config, tests                     | None for foundation; future CI/remote hardening belongs to Phase 10.                                                                                    |
|    02 | Brand, UX and design system                      | Complete and verified                               | `docs/evidence/phase-02/VERIFICATION.md`                                                      | Later: SVG/icon logo exports, visual snapshots, richer form/dialog primitives.                                                                          |
|    03 | Architecture contracts and threat model          | Complete and verified                               | `docs/evidence/phase-03/VERIFICATION.md`                                                      | None for contracts; later phases must obey these docs.                                                                                                  |
|    04 | Data and backend foundation                      | Complete and verified locally                       | `docs/evidence/phase-04/VERIFICATION.md`                                                      | Production backup/secrets/monitoring execution remains for Phases 10 and 11.                                                                            |
|    05 | Identity, tenancy and authorization              | Not started                                         | `plans/phase-05-identity-tenancy-authorization.md`                                            | Select self-hosted identity approach, implement auth, sessions, MFA policy, org membership, roles, tenant-safe authorization, placement registry tests. |
|    06 | CMS and content platform                         | Not started                                         | `plans/phase-06-cms-content-platform.md`                                                      | Install/configure Payload CMS, content collections, workflows, media rules, SEO fields, previews and CMS roles.                                         |
|    07 | Public website experience                        | Not started as full phase; early public pages exist | `plans/phase-07-public-website-experience.md`, `apps/web`                                     | Build full public website experience from CMS/design system: product, service, industry, work, resource, contact/form journeys.                         |
|    08 | Content, SEO and public search                   | Not started                                         | `plans/phase-08-content-seo-public-search.md`                                                 | SEO schema, sitemap, metadata, content architecture, search, resource pages and publishing flow.                                                        |
|    09 | Lead engine, demo booking and CRM                | Not started                                         | `plans/phase-09-lead-engine-demo-crm.md`                                                      | Forms, consent capture, demo booking, lead routing, CRM pipeline, notifications and idempotent lead intake.                                             |
|    10 | Infrastructure, environments and delivery        | Not started beyond local compose                    | `plans/phase-10-infrastructure-environments-delivery.md`                                      | Hetzner/Cloudflare-ready deployment, environments, secrets, backups, release pipeline and cost-controlled topology.                                     |
|    11 | Security operations, observability and recovery  | Not started beyond docs/contracts                   | `plans/phase-11-security-observability-recovery.md`                                           | Logs, metrics, alerts, incident process, restore drills, monitoring, security scanning and operational recovery.                                        |
|    12 | V1 integration, hardening and launch             | Not started                                         | `plans/phase-12-v1-integration-hardening-launch.md`                                           | Integrate Phases 07-11, run launch gates, browser/accessibility/security/performance checks, publish V1.                                                |
|    13 | Staff operations platform                        | Not started                                         | `plans/phase-13-staff-operations-platform.md`                                                 | Staff dashboard, CRM operations, content/support/admin workflows after V1 launch.                                                                       |
|    14 | Commercial, support and document workflows       | Not started                                         | `plans/phase-14-commercial-support-document-workflows.md`                                     | Quotes, proposals, support, document handling and commercial workflow records.                                                                          |
|    15 | Custom-development client portal                 | Not started                                         | `plans/phase-15-custom-development-client-portal.md`                                          | Secure client project portal, milestones, approvals, files, support and notifications.                                                                  |
|    16 | Product customer account and control plane       | Not started                                         | `plans/phase-16-product-customer-account-control-plane.md`                                    | Product plans, subscriptions, entitlements, licenses, downloads, account portal and product support.                                                    |
|    17 | Product integrations and offline-first operation | Not started                                         | `plans/phase-17-product-integrations-offline-first.md`                                        | Product API/SDK, signed events, installation credentials, offline leases, sync and conflict handling.                                                   |
|    18 | Intelligence, automation and global scale        | Not started and intentionally deferred              | `plans/phase-18-intelligence-automation-global-scale.md`                                      | Only after production evidence: analytics, automation, AI support, developer APIs, regional scale and compliance expansion.                             |

## Phase 04 Current Implemented State

Phase 04 is the most recent completed implementation phase.

Implemented:

- PostgreSQL migrations:
  - `0001_initial_v1.sql`
  - `0002_privacy_operations_v1.sql`
- Database package:
  - migration policy helpers
  - package migration runner
  - PostgreSQL pool factory
  - runtime readiness checks
  - privacy request persistence
  - durable outbox repository
- Contracts package:
  - health contract
  - versioned event envelope
  - tenant context
  - storage metadata contract
  - privacy request lifecycle/hold contracts
- API app:
  - `/health`
  - `/ready` with database-backed readiness
  - `/version`
  - `/openapi.json`
  - `POST /privacy-requests`
  - correlation IDs
  - safe error envelopes
- Workers app:
  - no-op job foundation
  - outbox delivery cycle
  - retry, DLQ and authorized replay behavior
- Storage package:
  - private local object storage adapter
  - organization path isolation
  - allowed content type/size checks
  - no public URL surface
- Web app:
  - branded public shell and early pages exist
  - production Next.js build passes

Last full local verification passed with:

- Contracts tests: 14
- Database tests: 16
- Storage tests: 4
- UI tests: 3
- API tests: 10
- Worker tests: 5
- Web tests: 7
- Total tests: 59
- Next.js production build: pass
- Local database migration: pass
- Package migration runner: pass
- Formatting/lint/type checks: pass

Expected Nest test log note:

- API tests intentionally emit one Nest error log for
  `/test-errors/unexpected`; that test verifies unexpected errors do not leak
  secret details. The log is expected when the test suite passes.

## Current Git/Workspace Notes

Tracked code is clean after latest commit `8f3a5bf`.

Important untracked files/directories currently visible:

- `STACK_AND_SCALE_PLATFORM_BLUEPRINT_V1.md`
- `colorpallet.jpeg`
- `stackandscale_logo.jpeg`
- `plans/`
- `question-decisions/`
- `docs/program/`
- `docs/execution/phase-00/`
- `docs/evidence/phase-00/`
- `docs/operations/CAPACITY-LEDGER.md`
- `docs/operations/RESTORE-ORDER.md`
- `docs/privacy/IMPLEMENTATION-MATRIX.md`
- `docs/privacy/PROCESSOR-REGISTER.md`
- `docs/decisions/ADR-BACKUP-FAILURE-DOMAIN.md`
- `docs/decisions/ADR-SECRETS-MANAGEMENT.md`

Do not delete or overwrite these. They appear to be user/planning artifacts
that should be reviewed and committed deliberately in a separate documentation
step.

## Development Environment Rules

The user asked to keep downloads, temporary files and Node caches on the Data
partition because the Ubuntu partition is low on space.

Before dependency installs or long local work, source:

```sh
source scripts/development-environment.sh
```

If pnpm reports an unexpected store location, use the existing Data store:

```sh
pnpm --store-dir /media/saad/Data/.pnpm-store ...
```

Do not move Docker overlay data to `/media/saad/Data` because that partition is
not suitable for Docker overlay storage. Docker currently reports root dir as
`/var/lib/docker`.

Local PostgreSQL container:

- Container name: `stack-and-scale-postgres`
- Port: `5433`
- Database: `stack_and_scale`
- User: `stack_and_scale`

Useful local commands:

```sh
source scripts/development-environment.sh
bash scripts/migrate-local-database.sh
cd packages/database && ../../node_modules/.bin/tsx src/migrate.ts
```

## Next Recommended Phase

Start Phase 05: identity, tenancy and authorization.

Before coding Phase 05:

1. Read `plans/phase-05-identity-tenancy-authorization.md`.
2. Read Phase 03 contracts:
   - `docs/architecture/TENANT-ISOLATION.md`
   - `docs/architecture/API-STANDARDS.md`
   - `docs/security/THREAT-MODEL.md`
   - `docs/security/DATA-CLASSIFICATION.md`
3. Read Phase 04 evidence:
   - `docs/evidence/phase-04/VERIFICATION.md`
4. Do not start CMS, CRM, public search or deployment before the Phase 05 auth
   boundary exists.

Recommended Phase 05 implementation order:

1. Identity provider decision and ADR, preferably self-hosted and within
   budget.
2. Auth/session foundations in API.
3. User, organization, membership and role schema migrations.
4. Tenant context derived from authenticated membership, not from trusted client
   input.
5. Authorization guard/service with deny-by-default behavior.
6. Staff MFA policy and recovery flow design.
7. Cross-tenant denial tests.
8. Placement registry/routing tests for shared, dedicated-schema and
   dedicated-database tiers.
9. Audit events for login, recovery, invitation, role and session changes.
10. Phase 05 verification document.

## Remaining Work Count

Execution phases remaining: 14

Critical-path phases remaining before V1 launch:

- Phase 05 identity/tenancy/auth
- Phase 06 CMS/content platform
- Phase 07 public website experience
- Phase 08 content/SEO/search
- Phase 09 lead engine/demo/CRM
- Phase 10 infrastructure/environments/delivery
- Phase 11 security/observability/recovery
- Phase 12 V1 integration/hardening/launch

Post-V1 phases remaining:

- Phase 13 staff operations
- Phase 14 commercial/support/document workflows
- Phase 15 client portal
- Phase 16 product customer account/control plane
- Phase 17 product integrations/offline-first
- Phase 18 intelligence/automation/global scale

Approximate large work packages remaining: 100+ across all phase plans.

The next concrete remaining thing is Phase 05, not Phase 06 or Phase 07.

## Do Not Do Yet

- Do not buy paid platforms.
- Do not provision production infrastructure.
- Do not implement staff portal, client portal, billing, product entitlements,
  product offline sync or AI automation before their phase gates open.
- Do not invent real customers, testimonials, metrics or case studies.
- Do not put secrets in Git.
- Do not use production personal data in local, preview or staging workflows.
- Do not mark V1 launch complete until Phase 12 passes.

## Handoff One-Liner

Stack & Scale has completed Phases 00-04 locally. The backend/data foundation
is now real and verified. Continue with Phase 05 identity, tenancy and
authorization, while preserving the USD 50/month budget, self-hosted-first
platform choices and the untracked planning/assets until they are reviewed.
