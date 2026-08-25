# Auth Components (WS10)

## SigninView (`apps/web/src/signin-view.tsx`)

- Presentational, server-renderable React function component. Props: `{ model: AuthContentModel }`. No state, no effects, no fetches.
- Structure: `section.signin` > copy block (eyebrow, `h1`, description) + `form.signin-card` (email label/input, Continue button, provider note, legal note).
- Form posts to `/api/auth/oidc/start`; button reuses the global `button button-primary` classes.
- Deliberately excluded: password input, remember-me, social buttons, error banners (belong to the auth backend WS once real error states exist).

## Supporting module

- `auth-content.ts`: `AuthContentModel` type + `createAuthContentModel` factory that rejects empty fields + exported `authContentModel` singleton. Mirrors homepage-content style.

## Reuse

- Tokens/classes come from `packages/ui` (`--ss-*`, `.ss-button` equivalents via app globals). No new component library entries required for this slice; if SigninCard is reused later, promote it into `packages/ui` then.
