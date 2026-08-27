# ADR: Phase 10 OVH VPS production host

## Status

Accepted on 2026-08-27 through
[`PC-2026-08-27-OVH-PRODUCTION-HOST`](../program/PLAN-CHANGES.md).

## Decision

Run the initial V1 service set on one **OVHcloud VPS-2** in London (UK):
4 vCores, 8 GB RAM and 75 GB NVMe. The service set remains Caddy, web, API,
CMS, workers, Keycloak and an internal-only PostgreSQL Docker service.

Cloudflare Free is the public DNS/edge layer. OVH's included daily backup is a
convenience copy only; it does not replace the separately credentialed,
encrypted off-server Restic backup and restore rehearsal.

## Context and consequences

The original Hetzner CX33 was unavailable in the owner's project when the
host was needed. The selected OVH plan supplies the same practical CPU/RAM
class without a long-term contract and remains within the USD 50/month program
ceiling.

The repository's `infra/tofu` module is **Hetzner-specific reference
infrastructure**. Do not run it against this OVH production host. The current
OVH host is owner-provisioned and uses documented SSH/Docker/UFW bootstrap;
the provider-neutral Compose, Caddy, deployment, backup and observability
artifacts remain the production application path.

Before public traffic, configure and verify Cloudflare-to-origin protection,
allow only the required public HTTPS ports, retain SSH key-only access,
configure independent backups and complete every Phase 10–12 launch gate.

## Reversal

The host can later move to Hetzner or another provider by deploying the same
immutable release to a new host, restoring a fresh encrypted backup in
isolation, validating critical journeys, switching Cloudflare DNS and keeping
the old host available as a short rollback window. Never use a live database
copy or destructive restore as the migration mechanism.
