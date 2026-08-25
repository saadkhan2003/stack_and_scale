# Auth Strategy (WS10)

## Slice

Staff sign-in shell for the platform web app. Presentational only: collects work email and hands off to OIDC (Keycloak). No password field, no client-side auth simulation.

## User goal

Authorized staff reach dashboards/tools quickly; everyone else understands access is restricted.

## Scope boundaries

- In: content module, presentational view, `/signin` route, tests, planning docs.
- Out: Keycloak integration, callback route handling, session cookies, header/nav changes (owned by other WS).

## Success criteria

- Email + continue form posts to a single well-known start endpoint.
- Provider note explains the redirect before it happens.
- Page renders inside the existing layout/header with zero navigation edits.
- Content is centralized in `apps/web/src/auth-content.ts`, validated by factory.
