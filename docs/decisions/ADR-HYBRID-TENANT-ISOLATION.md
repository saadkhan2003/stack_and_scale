# ADR — Hybrid Tenant Isolation

**Status:** Accepted for Phase 03

## Context

Stack & Scale must efficiently serve normal customers while being able to meet stronger enterprise isolation requirements without rebuilding the product model.

## Decision

Start with shared PostgreSQL tables keyed by organization and enforce a required tenant context. Support future dedicated-schema and dedicated-database placement through a registry and deny-safe routing abstraction. Authorization behavior is identical across tiers.

## Alternatives considered

- **Shared tables only:** lowest cost, but cannot meet all future isolation requirements.
- **Dedicated database for every customer:** strongest separation, but too costly and operationally heavy for V1.

## Consequences

- Every query, cache, job, file path, event and audit entry carries organization context.
- Tenant placement and moves require tested provisioning, verification, backup and restoration procedures.
- An unknown placement must deny access rather than silently use the shared tier.
