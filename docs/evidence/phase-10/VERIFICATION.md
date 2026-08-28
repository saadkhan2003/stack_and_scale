# Phase 10 verification record

## Local artifacts to verify

- `docker compose -f infra/compose.production.yaml config` with only example,
  non-secret configuration substituted.
- Dockerfile builds for API, web, CMS and workers.
- `tofu fmt -check -recursive infra/tofu` and a guarded `tofu plan` only for
  future disposable Hetzner staging; OpenTofu is not the OVH production-host
  provisioner.
- `scripts/deploy-promote.sh` and `scripts/deploy-rollback.sh` refusal paths
  without confirmations/credentials.
- `scripts/bootstrap-production-secrets.sh` creates mode-0600 local secret
  files, refuses overwrite, and never prints secret values.
- Environment, state, backup and rollback procedures in
  `docs/operations/PHASE-10-DELIVERY.md`.

## Local results

- The single-host production Compose file, including its internal-only
  PostgreSQL service, parses with non-secret placeholder configuration.
- Caddy validates with a locally generated test certificate; production
  requires a Cloudflare Origin Certificate because the OVH UFW policy permits
  only Cloudflare source CIDRs to ports 80 and 443.
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

## Owner-recorded production progress — 28 August 2026

The following production evidence was recorded from the OVH terminal,
Cloudflare dashboard and headed browser after this document's initial local
review. It proves a live first deployment, but it does not replace the
remaining recovery, monitoring and staged-release gates below.

- OVH VPS-2 is active on Ubuntu 26.04 with Docker Engine and Docker Compose.
- Cloudflare is active for `stackandscale.org`; the apex, `www`, `api`, `cms`
  and `identity` records are proxied to the OVH origin. UFW allows HTTP/HTTPS
  only from Cloudflare CIDRs and retains SSH access for the operator.
- The server has protected Cloudflare Origin Certificate files and a generated
  `/opt/stack-and-scale/.env.production`; no secret values are recorded here.
- PostgreSQL, API, web, CMS, workers, Caddy and Keycloak were started on the
  host. PostgreSQL, API, CMS and Keycloak reported healthy; Keycloak uses its
  internal HTTP listener behind Caddy's TLS termination.
- Public endpoint checks returned HTTP 200 for the home page, CMS admin login,
  API readiness and Keycloak discovery. A headed browser opened the public
  home page and CMS login page without browser-console errors.

The currently live images predate the following committed deployment hardening
and contact-content fix: `10e40f9`, `b64023d` and `c91d916`. They must be
built and promoted through the immutable delivery workflow after CI passes.

## External evidence required before marking production complete

- A successful immutable-image promotion of the current `main` commit to the
  OVH VPS, including the workflow's migration, CMS and Keycloak health gates.
- Confirm Cloudflare SSL/TLS is set to Full (strict), and retain certificate
  evidence for all four proxied application hostnames.
- Protected independent encrypted backup target with independent credentials
  and a full restore rehearsal.
- A separate disposable staging environment and OpenTofu state/plan are
  optional future infrastructure work; they do not provision this OVH host.
- Public-database host-port denial, deployment/migration/rollback rehearsal,
  private-cache test and capacity measurement.
- Named secret custodians, access/rotation/break-glass/lost-key evidence.

OVH's included daily VPS backup is useful for host recovery, but it is not a
substitute for the required independently credentialed, geographically separate
encrypted backup and tested restoration evidence.

The OVH VPS, Namecheap domain and Cloudflare zone were created by the owner.
An independently credentialed backup target, its automation and restore
evidence still do not exist.
