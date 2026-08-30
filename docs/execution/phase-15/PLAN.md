# Phase 15 Execution Plan

## Outcome

Deliver a feature-flagged client portal that exposes only allow-listed,
customer-scoped projections of canonical platform records. It must never become
a second source of truth for commercial, support, file, or audit data.

## Mandatory gate

`docs/architecture/PORTAL-SHARED-CONTRACTS.md` is frozen as the version `0.1`
technical baseline. Any modification requires a versioned amendment and
security review before a portal implementation lane consumes it.

## Work order

1. `15.0-contract-freeze`: record approvals, visibility decisions, roles, and
   feature flags in the frozen contract.
2. `15.1-access`: introduce portal principals, client membership and revocation
   enforcement without changing canonical commercial ownership.
3. `15.2-home-projects`: add bounded home and project projection read models.
4. `15.3-reviews`: add exact-version review and approval workflows.
5. `15.4-commercial-files`: add customer-safe commercial and deliverable views.
6. `15.5-support-activity`: add public-only support, activity and notification
   projections.
7. `15.6-assurance-rollout`: prove isolation, accessibility, capacity and
   organization-level rollout/rollback behavior.

## Write ownership

- `15.0` is the sole writer of the shared portal contract.
- `15.1` owns only portal authorization, feature flags and membership adapters.
- `15.2` through `15.5` own distinct portal controllers, projection services,
  DTOs, web routes and tests under their named domains.
- Canonical Phase 14 commercial, support, files, communications and audit
  modules are read-only inputs. Changes to them require a separate serialized
  contract amendment and owner review.
- Phase 16 cannot change shared contract files while any Phase 15 lane is
  active.

## Capacity and cost

The initial portal uses the existing OVH host, PostgreSQL, Keycloak and private
file boundary. Each step must measure the capacity ledger before release. The
rollout starts disabled per customer organization and has no paid-platform
dependency. Query caps, pagination, short signed URL lifetimes and independent
feature flags are the degradation controls.

## Evidence and rollback

Store evidence under `docs/evidence/phase-15/<step-id>/` without credentials or
customer data. Disabling a portal flag stops its projection only; it never
deletes canonical records. A security rollback revokes portal sessions and
stops newly issued signed URLs while staff-side workflows remain available.
