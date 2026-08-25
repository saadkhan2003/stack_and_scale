# Stack & Scale Project Status

Last updated: 2026-08-25 (refreshed after full-codebase review)
Current branch: `master`
Current latest commit: `66a4d30 chore: sync next env types`
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

Completed execution phases: 7 of 19 (Phases 00 through 06)

- Phase 00: complete as planning/program foundation, but many Phase 00 docs are
  currently untracked in Git.
- Phase 01: complete as repository/engineering foundation.
- Phase 02: complete and verified.
- Phase 03: complete and verified.
- Phase 04: complete and verified for local data/backend foundation.
- Phase 05: complete and verified locally, including live Keycloak bearer
  verification, OIDC Authorization Code + PKCE browser-flow endpoints,
  MFA checks for privileged roles, invitations, sessions, rate limiting and
  identity audit events.

Remaining execution phases: 12 of 19 (Phases 07 through 18)

- Phase 06: complete and verified locally (Payload CMS on Next.js +
  PostgreSQL: 17 collections, 13-block registry, editorial workflow, media
  rules, contract tests, browser-verified admin).
- Phase 07 through Phase 18 are not implemented yet.

## Phase Status Table

| Phase | Name                                             | Status                                              | Evidence                                                                                      | Main Remaining Work                                                                                                             |
| ----: | ------------------------------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
|    00 | Program constitution and readiness               | Complete, untracked evidence present                | `docs/execution/phase-00/`, `docs/evidence/phase-00/`, `docs/program/`, `question-decisions/` | Commit or intentionally archive the currently untracked Phase 00 planning files after review.                                   |
|    01 | Repository and engineering foundation            | Complete                                            | App/package shells, local Postgres compose, scripts, shared config, tests                     | None for foundation; future CI/remote hardening belongs to Phase 10.                                                            |
|    02 | Brand, UX and design system                      | Complete and verified                               | `docs/evidence/phase-02/VERIFICATION.md`                                                      | Later: SVG/icon logo exports, visual snapshots, richer form/dialog primitives.                                                  |
|    03 | Architecture contracts and threat model          | Complete and verified                               | `docs/evidence/phase-03/VERIFICATION.md`                                                      | None for contracts; later phases must obey these docs.                                                                          |
|    04 | Data and backend foundation                      | Complete and verified locally                       | `docs/evidence/phase-04/VERIFICATION.md`                                                      | Production backup/secrets/monitoring execution remains for Phases 10 and 11.                                                    |
|    05 | Identity, tenancy and authorization              | Complete and verified locally (152 tests green)     | `docs/evidence/phase-05/VERIFICATION.md`, `.planning/phase-05/`                               | Provider-side password recovery/email verification operational setup in Phases 10/11.                                           |
|    06 | CMS and content platform                         | Complete and verified locally                       | `docs/evidence/phase-06/VERIFICATION.md`, `apps/cms`                                          | Live-preview wiring into web app, scheduled publishing, CMS ESLint re-integration (typed-lint follow-up).                       |
|    07 | Public website experience                        | Not started as full phase; early public pages exist | `plans/phase-07-public-website-experience.md`, `apps/web`                                     | Build full public website experience from CMS/design system: product, service, industry, work, resource, contact/form journeys. |
|    08 | Content, SEO and public search                   | Not started                                         | `plans/phase-08-content-seo-public-search.md`                                                 | SEO schema, sitemap, metadata, content architecture, search, resource pages and publishing flow.                                |
|    09 | Lead engine, demo booking and CRM                | Not started                                         | `plans/phase-09-lead-engine-demo-crm.md`                                                      | Forms, consent capture, demo booking, lead routing, CRM pipeline, notifications and idempotent lead intake.                     |
|    10 | Infrastructure, environments and delivery        | Not started beyond local compose                    | `plans/phase-10-infrastructure-environments-delivery.md`                                      | Hetzner/Cloudflare-ready deployment, environments, secrets, backups, release pipeline and cost-controlled topology.             |
|    11 | Security operations, observability and recovery  | Not started beyond docs/contracts                   | `plans/phase-11-security-observability-recovery.md`                                           | Logs, metrics, alerts, incident process, restore drills, monitoring, security scanning and operational recovery.                |
|    12 | V1 integration, hardening and launch             | Not started                                         | `plans/phase-12-v1-integration-hardening-launch.md`                                           | Integrate Phases 07-11, run launch gates, browser/accessibility/security/performance checks, publish V1.                        |
|    13 | Staff operations platform                        | Not started                                         | `plans/phase-13-staff-operations-platform.md`                                                 | Staff dashboard, CRM operations, content/support/admin workflows after V1 launch.                                               |
|    14 | Commercial, support and document workflows       | Not started                                         | `plans/phase-14-commercial-support-document-workflows.md`                                     | Quotes, proposals, support, document handling and commercial workflow records.                                                  |
|    15 | Custom-development client portal                 | Not started                                         | `plans/phase-15-custom-development-client-portal.md`                                          | Secure client project portal, milestones, approvals, files, support and notifications.                                          |
|    16 | Product customer account and control plane       | Not started                                         | `plans/phase-16-product-customer-account-control-plane.md`                                    | Product plans, subscriptions, entitlements, licenses, downloads, account portal and product support.                            |
|    17 | Product integrations and offline-first operation | Not started                                         | `plans/phase-17-product-integrations-offline-first.md`                                        | Product API/SDK, signed events, installation credentials, offline leases, sync and conflict handling.                           |
|    18 | Intelligence, automation and global scale        | Not started and intentionally deferred              | `plans/phase-18-intelligence-automation-global-scale.md`                                      | Only after production evidence: analytics, automation, AI support, developer APIs, regional scale and compliance expansion.     |

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

## Repository Map (full-codebase review)

- Root: pnpm 11.19.0 workspace, Node >=24.18.0 <25. Scripts: `format`,
  `lint`, `typecheck`, `test`, `build`, `db:up/down/logs/reset` and a combined
  `verify` gate. ESLint flat config + Prettier at root; shared TS base in
  `packages/config/tsconfig.base.json`.
- `apps/api`: NestJS modular monolith. `main.ts`, `app.module.ts`,
  `app.controller.ts`; common HTTP layer with correlation-ID interceptor and
  API exception filter; `openapi.ts`; `platform-database.service.ts`.
  Endpoints: `/health`, `/ready`, `/version`, `/openapi.json`,
  `POST /privacy-requests`. Integration tests under `test/`.
- `apps/workers`: Node worker app. `noop-job.ts` job foundation and
  `outbox-worker.ts` delivery cycle with retry/DLQ/replay. Tests under
  `test/`.
- `apps/web`: Next.js (App Router) public shell. Routes: home, solutions,
  approach, design-system, admin stub. Content/data modules in `src/`
  (homepage-content, solutions-content, approach-content,
  design-system-catalog, cms-shell, health-page, navigation,
  site-header). Vitest tests plus Playwright e2e (`e2e/public-health.spec.ts`).
- `packages/database`: dependency-free migration/outbox policy helpers,
  Postgres pool (`postgres.ts`), package migration runner (`migrate.ts`),
  runtime readiness checks, privacy request persistence, durable outbox
  repository. Migrations: `0001_initial_v1.sql`,
  `0002_privacy_operations_v1.sql`. Seven test files.
- `packages/contracts`: health contract, versioned event envelope, tenant
  context, storage metadata, privacy request lifecycle/hold contracts.
  Five test files.
- `packages/storage`: private local object-storage adapter with organization
  path isolation and content-type/size checks; no public URL surface.
- `packages/ui`: design tokens (`tokens.css`), contrast utilities; design
  system and contrast tests.
- `infra/compose.yaml`: local PostgreSQL container only.
- `scripts/`: development-environment.sh (Data-partition caches),
  migrate-local-database.sh, reset-local-database.sh.
- `.github/workflows/ci.yml`: CI workflow for the verify pipeline.
- `docs/`: program governance (`program/`), architecture contracts
  (`architecture/`), threat model and data classification (`security/`),
  design system docs (`design/`), ADRs (`decisions/`), privacy register and
  matrix (`privacy/`), operations runbooks (`operations/`), per-phase plans
  (`execution/`) and verification evidence (`evidence/phase-00/02/03/04`).
- `plans/`: MASTER_IMPLEMENTATION_PLAN plus phase plans 00-18 and supporting
  standards/budget-guardrail docs.
- `question-decisions/`: 100 numbered product/architecture decision records.

## Current Git/Workspace Notes

Tracked code is clean after latest commit `8989b65`.

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

Start Phase 07: public website experience.

Phase 05 is complete for local scope; its verification evidence includes:

1. Identity provider ADR: self-hosted Keycloak
   (`docs/decisions/ADR-IDENTITY-PLATFORM.md`).
2. Deny-by-default role/permission policy in contracts.
3. Placement registry routing with fail-closed behavior.
4. Identity schema migration `0003_identity_tenancy_v1.sql`.
5. Tenant-safe protected route with cross-tenant denial tests.

Phase 07 should consume the approved CMS contracts and Phase 02 design system.
Follow `plans/phase-07-public-website-experience.md`; do not start Phase 08+
until its public-route, accessibility, performance and CMS-preview gates pass.

## Remaining Work Count

Execution phases remaining: 12

Critical-path phases remaining before V1 launch:

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

The next concrete remaining thing is Phase 07.

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

Stack & Scale has completed Phases 00-06 locally. Phase 07 is next: build the
CMS-backed public website while preserving the USD 50/month budget,
self-hosted-first platform choices and the untracked planning/assets until
they are reviewed.
