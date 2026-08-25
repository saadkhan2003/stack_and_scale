# Phase 05 Verification — Identity, Tenancy and Authorization (near-complete)

Date: 2026-08-25 (second increment, executed via 10 parallel workstreams)

## Workstream results

| WS  | Deliverable                                                                                      | Status                                             |
| --- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| 01  | Keycloak compose service + realm export + README (`infra/keycloak/`)                             | Done; `docker compose config` valid                |
| 02  | OIDC RS256 token validation with JWKS + subject resolution (`apps/api/src/auth/`)                | Done; 14 tests, no new deps, zero network in tests |
| 03  | Staff MFA policy contract + doc (`packages/contracts/src/mfa.ts`, `docs/security/MFA-POLICY.md`) | Done; 8 tests                                      |
| 04  | Invitation lifecycle endpoints (create/accept/replay/expiry)                                     | Done; 6 integration tests                          |
| 05  | Session lifecycle endpoints (list own active / revoke own)                                       | Done; 7 integration tests                          |
| 06  | Identity audit event persistence with sensitive-key refusal                                      | Done; 7 tests                                      |
| 07  | Sliding-window rate-limit interceptor hooks (429, fake clock)                                    | Done; 8 tests                                      |
| 08  | Privilege-escalation matrix (~50 assertions) + direct-API access tests                           | Done; 11 tests                                     |
| 09  | Identity backup/restore runbook (`docs/operations/IDENTITY-BACKUP-RESTORE.md`)                   | Done                                               |
| 10  | Staff sign-in UI shell + `.planning/ui` stage files                                              | Done; 4 tests                                      |

## Verification results

- Contracts tests: 38
- Database tests: 30
- API tests: 54
- Workers tests: 5
- Web tests: 11
- Storage tests: 4
- UI package tests: 3
- Total tests: 145 (was 59 after Phase 04, 80 after first Phase 05 increment)
- Formatting/ESLint/typecheck: clean across all packages
- Builds (tsc + Next.js production): pass
- Compose config: valid

## Integration wiring done by orchestrator

- `app.module.ts` imports AuthModule, SessionModule, InvitationModule.
- Contracts index re-exports MFA policy; database index re-exports audit ops.
- SessionModule and InvitationModule register ApiExceptionFilter for
  standalone safe error envelopes.

## Closure increment (same day)

1. **Live Keycloak E2E sign-in**: `apps/api/test/keycloak-live-signin.e2e.test.ts`
   (run with `KEYCLOAK_E2E=1`) proves a real Keycloak-issued bearer token
   authenticates on protected routes, tampered tokens are rejected, and the
   `x-actor-id` development header is refused when OIDC mode is enforced.
   Realm fixes required: `basic` default client scope restored (provides the
   `sub` claim), direct access grants + enabled E2E user for token issuance.
2. **Token-backed auth**: `ActorResolverService` accepts Bearer tokens via
   TokenValidator; the `x-actor-id` header remains only as an explicit
   development fallback, disabled when `NODE_ENV=production` or
   `STACK_AND_SCALE_DEV_ACTOR_HEADER=false`. All identity controllers now
   resolve actors through it.
3. **Rate limiting applied**: `RateLimitInterceptor` attached to session and
   invitation controllers.
4. **Audit call sites wired**: invitation created/accepted and session
   revoked now persist `identity.*` audit events through the Phase 05 writer.
5. Validator hardening: tokens without an `aud` claim fall back to matching
   the `azp` authorized party.

Test totals after closure: API 54 passed (+3 gated E2E skipped in normal
runs, 3/3 pass with KEYCLOAK_E2E=1), all other suites unchanged; lint,
formatting, typecheck and builds clean.

Remaining (post-closure, non-blocking): password recovery/email verification
flows are provider-side configuration tracked for Phase 10/11 operational
setup; OIDC start/callback browser redirect route lands with the staff
portal phase.
