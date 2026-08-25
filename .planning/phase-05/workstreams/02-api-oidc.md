# WS02 — OIDC token validation foundation

Goal: JWT bearer validation service so protected routes can authenticate via
Keycloak-issued tokens instead of the x-actor-id stand-in.

Owns: apps/api/src/auth/token-validator.ts, apps/api/src/auth/auth.module.ts,
apps/api/test/oidc-token-validation.test.ts.

Requirements:

- Validate RS256 JWTs: signature (JWKS fetch abstraction injectable),
  iss allow-list from env STACK_AND_SCALE_OIDC_ISSUER, exp/nbf, aud
  STACK_AND_SCALE_OIDC_AUDIENCE default "api".
- Map validated token subject -> identity.users.external_subject lookup;
  return actorId or denial reason (deny closed, no membership assumption).
- No network calls in tests: fake JWKS keys via node crypto generateKeyPairSync
  and sign test tokens with jose-free minimal code or inject a signer.
  If adding a dependency is unavoidable, STOP and report instead.
- Export AuthModule with TOKEN_VALIDATOR provider token.
  Verify: cd apps/api && ../../node_modules/.bin/vitest run test/oidc-token-validation.test.ts
