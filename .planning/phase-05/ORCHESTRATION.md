# Phase 05 Orchestration — Parallel Workstreams

Date: 2026-08-25. Orchestrator: main session. Each workstream below is owned
by exactly one subagent with disjoint file ownership. Shared registration
points (`apps/api/src/app.module.ts`, `packages/*/src/index.ts` re-exports)
are wired only by the orchestrator after all workstreams return.

## Rules every agent follows

- No code comments. Prettier + ESLint clean (`node_modules/.bin/prettier`,
  `node_modules/.bin/eslint`). Tests via `../../node_modules/.bin/vitest run`
  from the package dir. pnpm is unavailable; never call it.
- Nest DI: use explicit `@Inject()` decorators (emitDecoratorMetadata off).
- Deny-by-default everywhere; no secrets or tokens in logs.
- Do not touch files owned by another workstream.

## Workstreams

| #   | ID                        | Owner agent    | Files owned                                                                                                                                                                                   |
| --- | ------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | keycloak-infra            | keycloak-infra | `infra/compose.yaml` (Keycloak service only), `infra/keycloak/**`                                                                                                                             |
| 2   | oidc-token-validation     | api-oidc       | `apps/api/src/auth/**`, `apps/api/test/oidc*.test.ts`                                                                                                                                         |
| 3   | mfa-policy                | mfa-policy     | `docs/security/MFA-POLICY.md`, `packages/contracts/src/mfa.ts`, `packages/contracts/test/mfa.test.ts`                                                                                         |
| 4   | invitation-lifecycle      | invitations    | `apps/api/src/identity/invitations/**`, `apps/api/test/invitations*.test.ts`                                                                                                                  |
| 5   | session-lifecycle         | sessions       | `apps/api/src/identity/sessions/**`, `apps/api/test/sessions*.test.ts`                                                                                                                        |
| 6   | audit-events              | audit          | `packages/database/src/audit-operations.ts`, `packages/database/test/audit-operations.test.ts`                                                                                                |
| 7   | rate-limiting             | ratelimit      | `apps/api/src/common/http/rate-limit.*`, `apps/api/test/rate-limit*.test.ts`                                                                                                                  |
| 8   | security-test-matrix      | sectests       | `packages/contracts/test/authorization-matrix.test.ts`, `apps/api/test/direct-api-access.test.ts`                                                                                             |
| 9   | identity-recovery-runbook | runbook        | `docs/operations/IDENTITY-BACKUP-RESTORE.md`                                                                                                                                                  |
| 10  | staff-signin-ui           | signin-ui      | `.planning/ui/**`, `apps/web/src/auth-content.ts`, `apps/web/src/signin-view.tsx`, `apps/web/app/signin/page.tsx`, `apps/web/test/auth-content.test.ts`, `apps/web/test/signin-view.test.tsx` |

## Integration (orchestrator only)

- Register new API modules in `app.module.ts`.
- Re-export new contracts/database exports in package indexes.
- Run full verify pipeline, update `docs/evidence/phase-05/VERIFICATION.md`
  and `status.md`.
