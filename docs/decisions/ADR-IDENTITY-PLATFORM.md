# ADR — Identity Platform Selection

**Status:** Accepted for Phase 05

## Context

Question 083 locked the direction: a dedicated, standards-based identity
platform (OIDC/OAuth2) separate from application authorization. Phase 05
requires selecting a concrete provider through evidence. Constraints:

- USD 50/month total external-platform budget; licence cost must be $0.
- Self-hosted-first platform choice (Hetzner/Cloudflare topology later).
- Required capabilities: OIDC Authorization Code + PKCE, MFA (TOTP at
  minimum), email verification and password recovery, session revocation,
  organization-friendly realm/client structure, admin API, backup path,
- Operational reality: single operator; identity is a high-impact dependency.

## Options considered

| Criterion                    | Keycloak                    | Authentik               | Ory Stack (Kratos/Hydra) | Managed (Auth0/Clerk)      |
| ---------------------------- | --------------------------- | ----------------------- | ------------------------ | -------------------------- |
| Licence cost                 | $0                          | $0                      | $0                       | Recurring, scales with MAU |
| MFA/recovery/sessions        | Mature, complete            | Mature                  | Modular, assembly needed | Mature                     |
| Admin/backup tooling         | Full admin console + export | Full console            | CLI/API only             | Vendor console             |
| Resource footprint on V1 box | Heavy (~1 GB RAM JVM)       | Medium (~512 MB Python) | Lightest                 | N/A                        |
| Standards conformance        | Certified OIDC/OAuth2       | Strong                  | Certified                | Certified                  |
| Upgrade/export path          | Realm JSON export/import    | Export tools            | Config as code           | Proprietary risk           |
| Security history             | Long, actively patched      | Good                    | Good                     | Vendor-managed             |

## Decision

Adopt **Keycloak, self-hosted**, behind the existing reverse-proxy topology:

1. It is the most mature certified open-source provider with complete MFA,
   recovery, session-revocation and admin tooling out of the box — no custom
   password system and no glue code.
2. Realm-per-environment with clients per surface (`web`, `staff`, future
   `portal`, `account`) preserves the Question 083 boundary: applications
   never store passwords.
3. Realm JSON export/import plus PostgreSQL storage gives a straightforward,
   testable backup/restore procedure that fits the Phase 11 restore drills.
4. The heavier footprint is acceptable because identity runs alongside the
   monolith on the planned VPS within the budget ceiling; if footprint ever
   becomes a problem, the standards boundary (OIDC/JWT) allows revisiting
   Authentik or Ory without touching application authorization.

## Consequences

- Applications integrate via OIDC Authorization Code + PKCE; access tokens
  are JWTs validated by the API. Application roles/permissions stay in our
  own database (identity is not permission).
- Internal `platform.users` rows keep stable IDs mapped from the provider
  `sub` claim so a provider rollback preserves memberships.
- Keycloak operational burden (upgrades, backups, monitoring) belongs to
  Phases 10 and 11; local development may run it via compose when sign-in
  flows are exercised end to end.
