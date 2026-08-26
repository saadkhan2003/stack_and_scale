# Phase 08 verification evidence

## Implemented and verified locally

- Canonical, title, description and Open Graph metadata for public index and
  detail routes; CMS detail records use their published SEO values.
- Fallback/demonstration detail routes are `noindex`; the sitemap uses only
  stable public paths and published CMS records.
- `robots.txt` excludes admin, sign-in, maintenance and API paths.
- Organization and published Product, Service, Article and work JSON-LD are
  emitted without fabricated locations, offers or customer proof.
- CMS-indexed command search covers published products, services, work and
  resources and has a no-result state and keyboard-close behavior.
- Consent defaults to no analytics. The optional adapter only calls a configured
  client transport after explicit consent and sends allow-listed event fields.

Run from the repository root on 2026-08-26:

- `pnpm --filter @stack-and-scale/web lint` — PASS
- `pnpm --filter @stack-and-scale/web typecheck` — PASS
- `pnpm --filter @stack-and-scale/web test` — PASS (12 tests)
- `pnpm --filter @stack-and-scale/web build` — PASS
- `pnpm --filter @stack-and-scale/web test:e2e` — PASS (4 Chromium journeys)
- Redirect-target validation — PASS (relative, HTTPS and linked CMS-page
  targets accepted; HTTP, JavaScript and incomplete targets rejected)

The production server was also checked for canonical `/products`, `robots.txt`
and `sitemap.xml` output.

CMS redirects are resolved by the Next 16 proxy with an 800ms CMS timeout and
fall through to the requested route if the CMS is unavailable. The initial
Pakistan/international intent map is recorded in `docs/seo/INTENT-MAP.md`; it
explicitly forbids doorway and unverified location content.

## External release work still required

The domain owner must configure the actual production `NEXT_PUBLIC_SITE_URL`,
verify Search Console ownership, submit the production sitemap and establish
index-coverage alert thresholds. A self-hosted analytics endpoint, processor
record, retention/deletion behavior and approved production legal wording must
be supplied before analytics is enabled. These external actions are intentionally
not represented as complete by this evidence file.
