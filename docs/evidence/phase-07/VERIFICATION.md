# Phase 07 verification evidence

## Automated checks

Run from the repository root on 2026-08-25:

- `pnpm --filter @stack-and-scale/web lint` — PASS
- `pnpm --filter @stack-and-scale/web typecheck` — PASS
- `pnpm --filter @stack-and-scale/web test` — PASS (12 tests)
- `pnpm --filter @stack-and-scale/web build` — PASS
- `pnpm --filter @stack-and-scale/cms lint` — PASS
- `pnpm --filter @stack-and-scale/cms build` — PASS

## Runtime checks

The production web server returned `200` for the homepage and representative
catalog, detail, services, industries, work, resources, company, contact and
privacy routes. An unknown page renders the not-found experience. The preview
endpoint returns `401` when called without its secret.

## Scope and release caveats

- CMS collection and page content are fetched with a 60-second Next cache and
  clearly labelled demonstration fallbacks when no published record exists.
- Product filters, reduced-motion rules, keyboard-visible focus styles and
  responsive layouts are implemented.
- Browser Use could not launch a Chrome CDP session in this local environment,
  so this file does not claim a fresh visual-browser, automated accessibility,
  poor-network or performance-trace pass.
- The Phase 00 content inventory records the asset-driven case-study deferral.
- The privacy/cookie text is explicitly demonstration-only. Production release
  remains blocked until the company owner and legal reviewer supply and approve
  actual data practices, processors, retention and contact details.
