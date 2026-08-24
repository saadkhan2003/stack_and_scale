# Hybrid Tenant Isolation

## Supported tiers

| Tier | Placement | Use |
|---|---|---|
| Shared (V1 default) | shared database tables with `organization_id` | normal customers and internal V1 workloads |
| Dedicated schema | one PostgreSQL schema per organization | justified contractual or operational separation |
| Dedicated database | separate database and storage boundary | highest isolation, regulated or enterprise requirement |

Product instances may also be hosted separately or offline-first. This does not alter the central platform's authorization contract.

## Enforceable query contract

Every tenant request resolves a `TenantContext` containing organization ID, actor/service identity, role/permissions, placement ID and correlation ID. A repository must require this context for tenant reads/writes; absence, mismatch or unknown placement fails closed. Cache keys, jobs, file paths, events and audits include organization context. Authorization occurs before retrieval; filtering an already retrieved mixed-tenant result is forbidden.

## Placement registry and routing

The central registry owns organization → tier → connection reference → storage scope → migration state. It contains no database password. A routing abstraction obtains an approved scoped connection from the secret provider; an unknown, disabled or transition-state placement rejects the request and raises an operational alert rather than falling back to shared data.

## Provisioning, movement and recovery

1. Create organization, placement record and least-privilege storage/database scope.
2. Run isolated migrations and verification before enabling access.
3. For a tier move, place writes in a controlled migration mode, create a consistent snapshot, copy/backfill, verify counts/checksums, switch the registry atomically, then retain the source read-only through the rollback window.
4. Backup ownership follows placement. Restore drills prove the registry, data, storage and authorization routing are restored together.
5. Decommissioning applies retention/legal-hold checks, revokes access, destroys scoped secrets, and records audit evidence.

## Required test scenarios

- shared-tier cross-organization read/write is denied;
- each supported tier accepts only its own organization context;
- cache/job/file/event identifiers cannot collide across organizations;
- unknown placement denies safely;
- tier move preserves authorization and records, including failure rollback;
- isolated backup restore returns only the intended organization data.
