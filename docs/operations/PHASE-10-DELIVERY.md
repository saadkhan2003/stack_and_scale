# Phase 10 delivery and environment operations

## Environment contract

| Environment  | Data and secrets                                                | Lifetime                  | Promotion rule                                                      |
| ------------ | --------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------- |
| Local        | Synthetic/local-only values                                     | Developer controlled      | Never accesses production systems.                                  |
| Test/preview | Sanitized fixtures and scoped values                            | Preview: at most 72 hours | Reviewed change only; no production data.                           |
| Staging      | Sanitized production-like fixtures and separate state           | Ephemeral release window  | Same immutable image that may be promoted.                          |
| Production   | Production-only encrypted values and one-host internal database | Controlled                | Protected approval, migration gate, health and business smoke test. |

## Delivery rule

Build images once from a commit SHA. Promote the same SHA to staging and then
production; never rebuild a tag during promotion. `scripts/deploy-promote.sh`
requires the target, immutable tag, remote target and explicit production
confirmation. It pulls the exact image, runs forward-only migrations, starts
services, performs health checks and writes a deployment record containing the
image SHA and discovered schema version.

Use `scripts/deploy-rollback.sh <environment> <previous-sha>` only after
checking the previous image is retained and the current schema remains
backward-compatible. Migrations roll forward; do not manually edit schemas.

## IaC and state

Production uses the owner-provisioned OVHcloud VPS-2 recorded in
`ADR-PHASE-10-OVH-VPS-PRODUCTION-HOST.md`. Its `ubuntu` administrator is
SSH-key-only; Docker, Fail2ban and UFW are installed on the host. PostgreSQL
is an internal-only Compose service: it has no host port and cannot be reached
from the Internet.

`infra/tofu` remains a Hetzner-specific reference/staging module and **must
not** be applied to the OVH production host. If OpenTofu state is used for a
future provider integration, it must use the independent S3-compatible backend
described by `backend.hcl.example`; state credentials must not be stored with
the application environment.

Run `scripts/tofu-plan.sh staging` first. `scripts/tofu-apply.sh` requires a
reviewed plan plus `CONFIRM_INFRA_APPLY=<environment>`. A provider account,
real domain/Cloudflare zone, SSH key name, operator CIDR and protected backup
location are user-owned prerequisites; no script creates them implicitly.

Run `scripts/tofu-drift.sh production` at least weekly and before every
production apply. An exit code of `2` means drift was found and must be
reviewed before any apply. Staging is explicitly disposable: after its
evidence is exported, use `CONFIRM_STAGING_DESTROY=staging
scripts/tofu-destroy-staging.sh`. Never use the destroy helper for production.

After the infrastructure apply, the secret custodian creates an untracked
`.env.production` file from the example. The delivery workflow brings up the
internal PostgreSQL service, waits for its health check, migrates it and then
starts the remaining services. Only `infra/` is synchronized; secret files
never move through CI.

For the current OVH production host, create the initial environment directly
on the host after manually running the protected **Bootstrap production host
files** GitHub Actions workflow. That workflow copies only `infra/` and the
two server scripts; it does not build images or start any application service.
Then open an SSH terminal to the VPS and run:

```bash
cd /opt/stack-and-scale
ACME_EMAIL='your-admin-notification-inbox' \
CRM_NOTIFICATION_EMAIL='your-admin-notification-inbox' \
bash scripts/bootstrap-production-secrets.sh
```

The script generates the PostgreSQL, Payload and Keycloak administrator
secrets locally, writes `/opt/stack-and-scale/.env.production` with mode 0600,
and never prints the values. It creates a temporary local Keycloak credential
record under `/opt/stack-and-scale/secrets/`; save that record in a password
manager and remove it after confirming the Keycloak administrator login. Do
not put these values in GitHub Actions secrets: the deployment workflow only
needs host access and package-registry read access.

## Edge, secrets and backups

Caddy terminates TLS and is the sole public origin service. The application,
CMS, API and identity routes share Caddy; PostgreSQL shares only the internal
Docker database network and publishes no host port. Production values live in an
untracked `.env.production` based on `.env.production.example`; never bake
them into images.

Before public traffic, configure the OVH host firewall so SSH remains
key-only/administratively restricted and ports 80/443 accept only current
official Cloudflare source CIDRs. Record a direct-origin denial test. The
existing UFW baseline intentionally exposes only SSH until this edge rule is
implemented and tested.

The web image is promotion-safe across environments: `SITE_URL` is resolved
server-side at runtime and CMS live-preview derives `cms.<current-domain>` in
the browser. The WhatsApp business number is public, is intentionally supplied
as a protected GitHub _variable_ at image build time, and must never be an API
secret.

The production Keycloak realm is imported once from
`infra/keycloak/realm-stack-and-scale.production.json.tmpl`; it deliberately
contains neither local Mailpit SMTP settings nor test users. Configure the
production email provider in Keycloak after the first import and retain that
configuration in the protected identity recovery record. Realm template edits
do not overwrite an existing realm; use a reviewed Keycloak administration
change for upgrades.

Configure protected CI environment secrets for the app host, its pinned SSH
`known_hosts` entry, and a least-privilege `read:packages` registry token. The
promotion script logs the host into the container registry with that token,
retries readiness, and restores the previous image on a failed gate. This
rollback is permitted only because migrations are forward-only and must remain
backward-compatible.

Keep the current plus two previous immutable image tags in GHCR. Set GitHub
Actions artifact retention to 14 days and set provider budget alerts at 50%,
75%, 90% and 100% of USD 50. Staging is created only for a release rehearsal
and destroyed immediately afterward; Cloudflare remains on its Free plan.

Before production deployment, select and document an independently
credentialed, geographically separate encrypted backup target. Verify that
primary OVH-host credentials cannot delete it. Follow
`docs/operations/RESTORE-ORDER.md` and
`docs/decisions/ADR-BACKUP-FAILURE-DOMAIN.md`.

This one-server design is a cost-first launch topology, not high availability:
a host outage stops web, CMS, identity and PostgreSQL together. The independent
encrypted backup and restore rehearsal are therefore non-negotiable.

## Capacity and spend gates

The initial ceiling is USD 50/month, with the USD 46.90 planned maximum in
`plans/BUDGET_GUARDRAILS.md`. Do not create always-on staging. Record service
CPU, memory, disk, I/O, database connections and backup volume using
`scripts/measure-capacity.sh`; compare it with
`docs/operations/CAPACITY-LEDGER.md` before release.
