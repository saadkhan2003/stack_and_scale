# Keycloak (local development)

Self-hosted identity provider per `docs/decisions/ADR-IDENTITY-PLATFORM.md`.

## Run

```
docker compose -f infra/compose.yaml up -d keycloak
```

Console: http://localhost:8084 — admin credentials come from env:

- `KEYCLOAK_ADMIN` (default `admin`)
- `KEYCLOAK_ADMIN_PASSWORD` (default `local-development-only`)

These defaults are local-development-only. Never reuse them anywhere real.

## Realm

`realm-stack-and-scale.json` is imported on startup (`--import-realm`). It
defines realm `stack-and-scale`, clients `web` (public, PKCE S256 enforced)
and `api` (bearer-only resource), realm roles `owner`/`admin`/`manager`/
`member`, and one disabled test user (`test-user`). The file contains no
secrets; enable the test user and set a password through the admin console.

Note: `--import-realm` only imports if the realm does not already exist.
Delete the `stack-and-scale-keycloak-data` volume to re-import a changed
export.

## Database

V1 local uses Keycloak's dev-file H2 storage for simplicity. For the
Postgres option (recommended before any shared/persistent environment), add
to the keycloak service environment:

- `KC_DB: postgres`
- `KC_DB_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}`
- `KC_DB_USERNAME: ${POSTGRES_USER}`
- `KC_DB_PASSWORD: ${POSTGRES_PASSWORD}`

and create a dedicated database/user on the existing postgres container via
an init script or manual setup. Keep credentials in env, never in files.

## Health

Management/health probes are enabled on port 9000 inside the container
(`/health`, `/health/ready`) and wired into the compose healthcheck.

## Local recovery email verification

`docker compose -f infra/compose.yaml up -d mailpit` starts the
development-only Mailpit inbox at http://localhost:8025. The local realm sends
password-update and verification messages to the `mailpit` service on SMTP
port 1025; no message leaves the Docker network. Never copy this SMTP setting
to a shared or production realm.
