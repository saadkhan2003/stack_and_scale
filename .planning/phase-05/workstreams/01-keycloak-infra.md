# WS01 — Keycloak local infrastructure

Goal: add a self-hosted Keycloak service to the local compose topology per
docs/decisions/ADR-IDENTITY-PLATFORM.md.

Owns: infra/compose.yaml (append keycloak service + volume), infra/keycloak/realm-stack-and-scale.json, infra/keycloak/README.md.

Requirements:

- Keycloak 26 (quay.io/keycloak/keycloak), start optimized dev mode
  (`start-dev`), health probes, port 8084 to avoid collisions.
- Realm export `realm-stack-and-scale.json`: realm `stack-and-scale`,
  clients: `web` (public, PKCE S256), `api` (bearer-only style resource),
  roles owner/admin/manager/member defined at realm level; one test user
  disabled by default. No real secrets in files; admin via env with local-
  development-only defaults matching compose postgres conventions.
- Keycloak DB: dedicated schema/user on existing postgres container is NOT
  required for V1 local; use dev-file H2 only if simpler, but prefer
  documenting the Postgres option in README (no secrets).
- compose must keep existing postgres service untouched otherwise.
  Verify: docker compose config validates (docker compose -f infra/compose.yaml config -q).
