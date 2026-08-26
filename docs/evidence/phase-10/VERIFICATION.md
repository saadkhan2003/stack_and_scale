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
- The browser target is currently not running locally, so browser evidence of
  the deployed edge cannot be recorded until a staging URL exists.

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
