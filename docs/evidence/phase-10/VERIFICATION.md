# Phase 10 verification record

## Local artifacts to verify

- `docker compose -f infra/compose.production.yaml config` with only example,
  non-secret configuration substituted.
- Dockerfile builds for API, web, CMS and workers.
- `tofu fmt -check -recursive infra/tofu` and a guarded `tofu plan` once
  protected backend configuration and a non-production Hetzner token exist.
- `scripts/deploy-promote.sh` and `scripts/deploy-rollback.sh` refusal paths
  without confirmations/credentials.
- Environment, state, backup and rollback procedures in
  `docs/operations/PHASE-10-DELIVERY.md`.

## Local results

- Production and database Compose files, plus Caddy configuration, parse with
  non-secret placeholder configuration.
- Script syntax and refusal paths pass without cloud credentials.
- Staging destruction and drift helpers have explicit confirmation/exit paths;
  their provider execution is intentionally pending protected state and token.
- Headed in-app browser verification passed for `http://127.0.0.1:3000/` and
  `/contact`: page titles and public content render, and the contact form,
  consent acknowledgement and intent choices are visible. This does not prove
  the future Caddy/Cloudflare edge; that requires a staging URL.
- With the local API started against local PostgreSQL, `GET /health`, `GET
  /ready` (application/database/migrations/outbox/privacy all `up`) and the
  web proxy `GET /api/demo-slots` returned successful contracts. The headed
  browser client blocks direct JSON `/api/*` navigation, so this last check is
  recorded from the server request rather than a browser rendering.

## External evidence required before marking production complete

- Approved Hetzner project, region, live price calculation and no-cost/within-
  budget Cloudflare configuration.
- Protected independent IaC state and geographically separate encrypted backup
  target with independent credentials.
- Reviewable OpenTofu plan and drift procedure.
- Recreated ephemeral staging environment, destroyed after validation.
- Public-database reachability denial, deployment/migration/rollback rehearsal,
  private-cache test and capacity measurement.
- Named secret custodians, access/rotation/break-glass/lost-key evidence.

The IaC includes provider-managed daily backups for both nodes, but this is
not a substitute for the required independently credentialed, geographically
separate encrypted backup and tested restoration evidence.

No production resource, DNS record, secret, state backend or backup target has
been created by this repository.
