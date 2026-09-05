# Stack & Scale

Stack & Scale is a production-oriented software-company platform. It combines
a public marketing site, Payload CMS, lead intake and demo booking, a
session-protected staff CRM, and self-hosted identity and delivery tooling.

This repository is the source of truth for the application and its local
deployment foundation. Product decisions and implementation authority are in
[docs/program/AUTHORITY.md](./docs/program/AUTHORITY.md); the current handoff
is in [status.md](./status.md).

> **Current State:** **Live in Production** at [https://stackandscale.org](https://stackandscale.org)  
> Automated immutable CI/CD delivery is active on GitHub Actions and GHCR. Edge TLS 1.3 Full (Strict), Keycloak 26 OIDC, MinIO encrypted S3 vault with ClamAV antivirus, and Prometheus/Grafana telemetry are healthy on OVHcloud host `51.195.136.215`.  
>  
> :books: **Documentation & Operational Manuals:**  
> - [Official Platform User Manuals](./docs/manuals/README.md)  
> - [Security Policy](./SECURITY.md)  
> - [Contributing Guide](./CONTRIBUTING.md)  
> - [Emergency Incident Response Runbook](./docs/operations/INCIDENT-RESPONSE.md)  
> - [Team QA Credentials & Environment](./docs/qa/TEAM-CREDENTIALS-AND-ENVIRONMENT.md)

## What is included

- Public pages for products, services, work, resources and contact.
- Structured Payload CMS content, drafting, preview and publishing workflows.
- Lead capture for product demos, custom projects and general contact.
- Consent acknowledgement, attribution, rate limiting, idempotency and audit
  records for public intent forms.
- Demo-slot selection, collision prevention and alternate-time requests.
- Staff CRM for leads, opportunities, notes, tasks, activities and ownership.
- Keycloak-based authentication and role-aware staff access.
- Transactional email outbox with local Mailpit capture and a production
  Resend adapter.
- Docker, Caddy, OpenTofu and GitHub Actions delivery artifacts for Phase 10.
- Internal metrics/logging, monitoring configuration, encrypted-backup tooling
  and security/incident operations artifacts for Phase 11.

## Architecture

The initial production design is deliberately cost-first:

```text
Visitor
  │
Cloudflare Free (DNS / CDN / edge controls)
  │
Caddy on one OVHcloud VPS-2 server
  ├── Next.js public web + staff CRM
  ├── NestJS API
  ├── Payload CMS
  ├── workers / transactional outbox
  ├── Keycloak identity
  └── PostgreSQL (internal Docker network; no public host port)

Independent encrypted off-server backup target
```

This is **not** high availability: a host outage stops all services. The
independent backup and restoration rehearsal are mandatory before a real
launch. The previous two-server database design is intentionally documented
and can be restored when capacity or reliability requires it:
[single-server topology ADR](./docs/decisions/ADR-PHASE-10-SINGLE-SERVER-TOPOLOGY.md).

## Technology

| Area       | Choice                           | Purpose                                           |
| ---------- | -------------------------------- | ------------------------------------------------- |
| Public web | Next.js / React                  | Public site, forms and staff UI                   |
| API        | NestJS + Fastify                 | Business APIs, CRM and intent processing          |
| CMS        | Payload CMS                      | Editorial content and publishing workflow         |
| Database   | PostgreSQL                       | Leads, CRM, CMS, audit and outbox data            |
| Identity   | Keycloak                         | Login, roles, sessions, recovery and verification |
| Workers    | Node.js                          | Durable transactional-email delivery              |
| Edge       | Caddy + Cloudflare Free          | TLS, request routing and security headers         |
| Delivery   | Docker, OpenTofu, GitHub Actions | Reproducible infrastructure and promotion         |

Keycloak, PostgreSQL, Docker, Caddy and OpenTofu are open source. They do not
require software licences; the production costs are the OVHcloud server, domain,
backups and any paid email volume.

## Prerequisites

- Node.js **24.18.x** (`>=24.18.0 <25`)
- pnpm **11.19.0**
- Docker Engine with Docker Compose
- Git

The repository expects its dependency caches on the Data partition. Before any
install or local development command, run:

```bash
source scripts/development-environment.sh
```

## Local setup

```bash
git clone git@github.com:saadkhan2003/Stack_and_Scale.git
cd Stack_and_Scale

source scripts/development-environment.sh
pnpm install --frozen-lockfile
./scripts/dev.sh
```

`./scripts/dev.sh` starts local PostgreSQL and Keycloak, applies the local
migrations, then starts the API and web application.

### Local URLs

| Service       | URL                           |
| ------------- | ----------------------------- |
| Public web    | http://localhost:3000         |
| Contact form  | http://localhost:3000/contact |
| API health    | http://127.0.0.1:3100/health  |
| API readiness | http://127.0.0.1:3100/ready   |
| Keycloak      | http://localhost:8084         |
| Mailpit inbox | http://localhost:8025         |

The Keycloak development credentials are intentionally local-only. Never copy
them to staging or production.

### CMS development

The CMS runs separately during development:

```bash
cd apps/cms
pnpm dev
```

It is expected at `http://localhost:3200/admin` when its CMS environment and
database configuration are available.

## Common commands

```bash
# Quality checks
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm verify

# Local database helpers
pnpm db:up
pnpm db:logs
pnpm db:reset
pnpm db:down

# Focused browser checks for the public web app
pnpm --filter @stack-and-scale/web test:e2e
```

## Repository layout

```text
apps/
  api/       NestJS API
  web/       Next.js public site and staff CRM UI
  cms/       Payload CMS
  workers/   Transactional outbox worker
packages/
  contracts/ Shared contracts and policies
  database/  PostgreSQL access, migrations and data operations
  config/    Shared TypeScript configuration
infra/
  compose.yaml                 Local PostgreSQL, Keycloak and Mailpit
  compose.production.yaml      One-host production Compose topology
  caddy/                       Edge routing and headers
  docker/                      Service Dockerfiles
  tofu/                        Hetzner reference infrastructure modules and environments
docs/                           Product, security, operations and evidence
plans/                          Phase plans and budget guardrails
scripts/                        Local development, migration and delivery tools
```

## Production deployment status

Phase 10 provides the local delivery implementation, including:

- A one-host Hetzner OpenTofu reference configuration. Production currently
  uses the documented OVH VPS host decision instead.
- Internal-only PostgreSQL Docker networking and persistent volume boundaries.
- Non-root multi-stage container images, health checks, resource limits and
  graceful shutdown behavior.
- Immutable image-promotion, migration, readiness-check, deployment-record and
  guarded-rollback tooling.
- Staging, drift-check and capacity-measurement scripts; their live execution
  remains a production-readiness gate.

The following must be completed by the infrastructure owner before production:

1. Buy/configure a domain and Cloudflare Free zone.
2. Use the documented OVH host bootstrap and Cloudflare edge configuration.
   The existing Hetzner OpenTofu module is not the OVH production path.
3. Create protected remote state before any future OpenTofu provider apply.
4. Configure a geographically separate encrypted backup target with independent
   credentials.
5. Configure protected CI/deployment secrets and a registry read token.
6. Apply and destroy a staging environment, test rollback, verify the database
   host port is unreachable, measure capacity and complete headed-browser edge
   verification.

Read [Phase 10 delivery operations](./docs/operations/PHASE-10-DELIVERY.md)
and [Phase 10 verification evidence](./docs/evidence/phase-10/VERIFICATION.md)
before attempting a deployment.

Read [Phase 11 security, observability and recovery operations](./docs/operations/PHASE-11-SECURITY-OBSERVABILITY-RECOVERY.md)
before enabling monitoring or backups. Its live alert routing, independent
backup repository, external uptime check, separate status hosting and restore
drill remain launch gates.

## Security and data handling

- Do not commit `.env`, production credentials, state backends or backup keys.
- Do not expose PostgreSQL through a public host port.
- Do not commit `apps/public/` unless its owner explicitly approves it for
  review and commit.
- Production staff CRM access requires a Keycloak membership with an approved
  organization role.
- Production transactional email requires sender-domain SPF, DKIM and DMARC.

See [the threat model](./docs/security/THREAT-MODEL.md),
[secrets ADR](./docs/decisions/ADR-SECRETS-MANAGEMENT.md), and
[restore order](./docs/operations/RESTORE-ORDER.md).

## Contributing

1. Create a branch from `main`.
2. Make focused changes without overwriting untracked user-owned files.
3. Run the smallest relevant checks, then `pnpm verify` when dependencies are
   available.
4. Document any production, security, privacy or operational change in the
   appropriate `docs/` or `plans/` artifact.
5. Use immutable commit-based delivery; do not manually alter production
   schemas or containers.

## Licence

No licence has been selected for this repository yet. Do not assume public
reuse rights until the project owner adds one.
