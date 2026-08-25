# Sign-in Page Implementation (WS10)

## Files

- `apps/web/src/auth-content.ts` — content model + validating factory
- `apps/web/src/signin-view.tsx` — presentational view
- `apps/web/app/signin/page.tsx` — route
- `apps/web/test/auth-content.test.ts` — content assertions
- `apps/web/test/signin-view.test.tsx` — module-level view assertions

## Flow

1. User visits `/signin`; page shows header + sign-in shell.
2. User enters work email, presses Continue.
3. Form POSTs to `/api/auth/oidc/start` (implemented by the auth backend WS, not this slice).
4. Provider note sets expectation of Keycloak redirect before submission.

## Constraints honored

- No changes to `site-header.tsx`, `navigation.ts`, `layout.tsx`, or `globals.css`.
- No new dependencies; React testing stack absent so view test stays module-level.
- Prettier-clean formatting, no comments in source.

## Verification

```
cd apps/web && ../../node_modules/.bin/vitest run test/auth-content.test.ts test/signin-view.test.tsx && ../../node_modules/.bin/tsc --noEmit
```
