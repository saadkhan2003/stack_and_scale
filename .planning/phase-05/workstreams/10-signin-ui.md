# WS10 — Staff sign-in UI planning + implementation

Goal: staff sign-in page shell plus populate the .planning/ui pipeline files
for this feature slice.

Owns:

- .planning/ui/0-brand/AUTH-BRAND-NOTES.md
- .planning/ui/1-strategy/AUTH-STRATEGY.md
- .planning/ui/2-design-system/AUTH-TOKENS.md
- .planning/ui/3-components/AUTH-COMPONENTS.md
- .planning/ui/4-implementation/SIGNIN-PAGE.md
- .planning/ui/5-audit/AUTH-AUDIT.md
- apps/web/src/auth-content.ts
- apps/web/src/signin-view.tsx
- apps/web/app/signin/page.tsx
- apps/web/test/auth-content.test.ts
- apps/web/test/signin-view.test.tsx

Requirements:

- Content module mirrors src/homepage-content.ts style (pure data +
  factory validating fields). Sign-in view is presentational only: email +
  continue flow stub stating OIDC sign-in happens via Keycloak; no password
  field, no fake auth. Page renders view inside existing layout/header.
  Do NOT modify site-header or navigation (not owned).
- Tests mirror existing vitest patterns in apps/web/test (content tests are
  plain ts; if no react testing setup exists, keep signin-view test to
  content/module-level assertions only — check first, adapt, report).
- Planning files: short, concrete, reference design-system catalog tokens
  used (colors/spacing from packages/ui/src/tokens.css naming).
