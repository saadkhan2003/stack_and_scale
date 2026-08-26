# ADR: Phase 10 single-server launch topology

## Status

Accepted for the cost-first initial launch on 2026-08-26. This decision is
deliberately reversible.

## Decision

Run the complete V1 service set on **one Hetzner CX33 server** (the
approximately USD 10/month server tier before IPv4 and tax):

- Caddy edge proxy
- public web application
- API
- CMS
- worker process
- Keycloak identity service
- PostgreSQL

PostgreSQL remains an internal-only Docker service on the `database` network.
It has no published host port and must never be exposed to the public Internet.

Keep provider backups enabled and keep the independent, encrypted off-server
backup requirement. A one-host layout is not high availability.

## Why this was chosen

The project owner explicitly selected a single low-cost server for launch. It
reduces the monthly compute cost substantially while traffic and operational
load are still unknown.

## What was removed from the earlier two-server design

The following previous Phase 10 elements were intentionally removed in commit
`22c57d2`:

- A separate Hetzner PostgreSQL server.
- A Hetzner private network and subnet between application and database hosts.
- A database-host firewall and private database IP variables.
- `infra/compose.database.production.yaml`.
- `.env.database.production.example`.
- `scripts/bootstrap-database.sh` and its SSH-bastion database bootstrap path.
- The database-host cloud-init template.
- Two-host capacity and budget allocations.

The application server now has the only reserved public IPv4 and the only
Hetzner compute resource in the OpenTofu module.

## Trade-offs and risks

- A server outage affects web, CMS, API, identity and database together.
- PostgreSQL competes with the other services for the same CPU, RAM and disk.
- There is no failover database host.
- Restoring from the independent backup is the recovery path after a host-loss
  event; it must be rehearsed before production launch.

## When to restore the two-server topology

Restore it when any of these is true:

- measured host CPU, RAM, disk, database I/O or connection usage reaches 70%
  of the declared capacity;
- PostgreSQL causes noticeable latency or reliability issues for public pages,
  CRM, CMS or identity;
- the business requires lower blast radius or independent database maintenance;
- expected downtime from a single-host failure is no longer acceptable;
- budget allows the additional database server and its backups.

## Instructions for a future agent to restore two servers

Tell the agent:

> Restore the Phase 10 two-server Hetzner topology described in this ADR. Keep
> PostgreSQL on a separate private database host with no public PostgreSQL port,
> restore independent application/database OpenTofu resources and firewalls,
> migrate production data safely, update deployment/backup/capacity evidence,
> and do not expose database credentials or ports publicly.

The agent should then restore or recreate the following design:

1. An application server for Caddy, web, API, CMS, workers and Keycloak.
2. A separate PostgreSQL server with its own persistent volume and provider
   backup setting.
3. A Hetzner private network/subnet between the two hosts.
4. A database firewall allowing PostgreSQL only from the application subnet;
   no public PostgreSQL port.
5. Separate database environment configuration and a safe bootstrap/migration
   procedure.
6. Updated capacity limits, budget forecast, restore procedures and a staging
   rehearsal before production cutover.

Do not restore the old files blindly. Recreate the two-server design against
the current codebase, lockfile, provider API and pricing, then run a reviewed
staging migration and rollback rehearsal.

## Related files

- `infra/compose.production.yaml`
- `infra/tofu/modules/hetzner-v1/`
- `docs/operations/PHASE-10-DELIVERY.md`
- `docs/operations/CAPACITY-LEDGER.md`
- `docs/operations/RESTORE-ORDER.md`
- `plans/phase-10-infrastructure-environments-delivery.md`
- `plans/BUDGET_GUARDRAILS.md`
