# Phase 07 verification evidence

## Automated checks

Run from the repository root on 2026-08-25:

- `pnpm --filter @stack-and-scale/web lint` — PASS
- `pnpm --filter @stack-and-scale/web typecheck` — PASS
- `pnpm --filter @stack-and-scale/web test` — PASS (12 tests)
- `pnpm --filter @stack-and-scale/web build` — PASS
- `pnpm --filter @stack-and-scale/cms lint` — PASS
- `pnpm --filter @stack-and-scale/cms build` — PASS
- `pnpm --filter @stack-and-scale/web test:e2e` — PASS (3 Chromium browser journeys)

## Runtime checks

The Chromium suite verifies the homepage CTAs, catalog/service/industry/work/
resource/company/contact routes, accessible product search, mobile menu and
not-found state. The preview endpoint returns `401` when called without its
secret.

## Scope and release caveats

- CMS collection and page content are fetched with a 60-second Next cache and
  clearly labelled demonstration fallbacks when no published record exists.
- CMS page edit views point their live-preview iframe to the public page URL;
  the public page sends the Payload readiness signal and applies same-origin
  live-preview document messages without exposing a CMS credential.
- Product filters, reduced-motion rules, keyboard-visible focus styles and
  responsive layouts are implemented.
- The Browser Use CDP connector could not launch its own Chrome session, but
  the repository's Playwright Chromium suite passed. This file does not claim
  an automated accessibility scan, poor-network simulation or performance trace.
- The Phase 00 content inventory records the asset-driven case-study deferral.
- The privacy/cookie text is explicitly demonstration-only. Production release
  remains blocked until the company owner and legal reviewer supply and approve
  actual data practices, processors, retention and contact details.
