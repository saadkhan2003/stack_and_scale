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

## Remaining for full Phase 05 closure

1. Boot Keycloak from compose and run a live end-to-end sign-in against the
   OIDC validator (set `STACK_AND_SCALE_OIDC_ISSUER`).
2. Replace the `x-actor-id` development stand-in on protected routes with
   TokenValidator-backed authentication.
3. Apply RateLimitInterceptor to auth routes once the OIDC start/callback
   routes exist.
4. Wire audit events into invitation/session/login flows (writer exists,
   call sites pending).
5. Password recovery/email verification flows (provider-side configuration +
   runbook steps).
