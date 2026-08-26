# Phase 10 delivery and environment operations

## Environment contract

| Environment | Data and secrets | Lifetime | Promotion rule |
| --- | --- | --- | --- |
| Local | Synthetic/local-only values | Developer controlled | Never accesses production systems. |
| Test/preview | Sanitized fixtures and scoped values | Preview: at most 72 hours | Reviewed change only; no production data. |
| Staging | Sanitized production-like fixtures and separate state | Ephemeral release window | Same immutable image that may be promoted. |
| Production | Production-only encrypted values and private database | Controlled | Protected approval, migration gate, health and business smoke test. |

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

`infra/tofu` creates the Hetzner private network, app/database firewalls and
separate app/database nodes. The database firewall has no public PostgreSQL
rule. Cloud-init creates the non-root `deployer` account and Docker runtime on
both nodes, so deployment does not depend on undocumented manual server setup.
State must use the independent S3-compatible backend described by
`backend.hcl.example`; state credentials must not be stored in Hetzner or the
application environment.

Run `scripts/tofu-plan.sh staging` first. `scripts/tofu-apply.sh` requires a
reviewed plan plus `CONFIRM_INFRA_APPLY=<environment>`. A provider account,
real domain/Cloudflare zone, SSH key name, operator CIDR and protected backup
location are user-owned prerequisites; no script creates them implicitly.

Run `scripts/tofu-drift.sh production` at least weekly and before every
production apply. An exit code of `2` means drift was found and must be
reviewed before any apply. Staging is explicitly disposable: after its
evidence is exported, use `CONFIRM_STAGING_DESTROY=staging
scripts/tofu-destroy-staging.sh`. Never use the destroy helper for production.

After the infrastructure apply, the secret custodian creates untracked
`.env.database.production` and `.env.production` files from the examples.
Bootstrap the private database node with `scripts/bootstrap-database.sh`, then
run the delivery workflow. Only `infra/` is synchronized; secret files never
move through CI. The database bootstrap transfers its own secret file only
over the secret custodian's encrypted SSH session; it must be run from that
custodian's managed workstation, not a shared developer environment.

## Edge, secrets and backups

Caddy terminates TLS and is the sole public origin service. The application,
CMS, API and identity routes share Caddy; the database is reachable only over
the Hetzner private network and its host firewall. Production values live in an
untracked `.env.production` based on `.env.production.example`; never bake
them into images.

The web image is promotion-safe across environments: `SITE_URL` is resolved
server-side at runtime and CMS live-preview derives `cms.<current-domain>` in
the browser. The WhatsApp business number is public, is intentionally supplied
as a protected GitHub *variable* at image build time, and must never be an API
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

Before production apply, select and document an independently credentialed,
geographically separate encrypted backup target. Verify that primary Hetzner
credentials cannot delete it. Follow `docs/operations/RESTORE-ORDER.md` and
`docs/decisions/ADR-BACKUP-FAILURE-DOMAIN.md`.

## Capacity and spend gates

The initial ceiling is USD 50/month, with the USD 46.90 planned maximum in
`plans/BUDGET_GUARDRAILS.md`. Do not create always-on staging. Record service
CPU, memory, disk, I/O, database connections and backup volume using
`scripts/measure-capacity.sh`; compare it with
`docs/operations/CAPACITY-LEDGER.md` before release.
