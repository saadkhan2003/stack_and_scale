# WS05 — Session lifecycle endpoints

Goal: list/revoke sessions backed by identity.sessions with timeout.

Owns: apps/api/src/identity/sessions/session.service.ts, session.controller.ts,
session.module.ts, apps/api/test/sessions.integration.test.ts.

Requirements:

- GET api/v1/sessions (actor's own sessions) and DELETE api/v1/sessions/:id
  (own only; revoking others requires role:assign + audit note out of scope).
- Sessions expire after 12h idle-expiry constant; revoked/expired rows never
  validate; response never includes tokens.
- Explicit @Inject, deny-by-default, safe envelopes.
- Integration tests >= 5: create fixture row, list own only, revoke own,
  revoke foreign session denied, revoked session absent after revocation.
