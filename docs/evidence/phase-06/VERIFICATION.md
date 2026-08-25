# Phase 06 Verification — CMS and Content Platform

Date: 2026-08-25

## Delivered

- **06.1 Foundation**: `apps/cms` is a dedicated Next.js 15 + Payload 3.88
  application (separate deployment responsibility from the public web app),
  PostgreSQL adapter pointed at the local compose database, Lexical editor,
  sharp image processing, invite-only admin (`disableSignup` equivalent via
  `create: () => false` access on cms-users), generated types
  (`src/payload-types.ts`) and import map, initial migration
  `20260825_105612_init_cms_schema.ts` applied (102 tables).
- **06.2 Core collections**: cms-users, media, pages, navigation,
  site-settings, redirects, products, services, industries, projects,
  resources, authors, team, testimonials, clients, careers, faqs.
- **06.3 Relationships**: products↔services/industries/products,
  projects→industry+services, resources→authors, pages→media (ogImage),
  navigation→pages, redirects→pages; related-content curated relations in
  the relatedContent block.
- **06.4 Controlled visual blocks**: 13-block registry
  (`src/blocks/index.ts`): hero (3 variants, maxRows 3 CTAs), richText,
  featureGroup, metricGroup, testimonialGroup, mediaBlock, gallery (min 2),
  videoEmbed (https-enforced), productShowcase, process, faqBlock,
  relatedContent, cta.
- **06.5 Editorial workflow**: roles administrator/publisher/editor/author,
  drafts + versions (maxPerDoc 25) on public collections, publish/rollback
  through version history, first-user registration then invite-only.
- **06.6 Media workflow**: alt text required, classification public/internal,
  mime allow-list (image/*, video/mp4, pdf), three image sizes with focal
  points.
- **06.7 Contract tests**: `test/content-contracts.test.ts` — 8 tests
  (SEO required fields, unique slugs, relationship populate + delete
  tolerance, minimal/typical block fixtures, unauthenticated cms-users
  denial, draft/published read semantics). Gated by `CMS_IT=1`.

## Verification results

- CMS contract tests: 8/8 passing against live local Postgres.
- Existing suites unchanged: API 54 (+3 gated Keycloak E2E), workers 5,
  contracts 38, database 30, storage 4, ui 3, web 11.
- ESLint (repo scope), Prettier, tsc: clean. CMS is excluded from the root
  typed-lint projectService (follow-up: dedicated CMS ESLint config);
  CMS is gated by tsc + prettier + vitest.
- Production build: `next build` passes for apps/cms.
- Browser QA (live, production build on :3200): login → dashboard renders
  all collection groups → created page through UI (title/slug/SEO) →
  added hero block via layout editor → saved draft (Versions=2) →
  published → REST confirmed `_status: published` with hero block and
  heading intact. Screenshots captured.
- Follow-up browser QA (local production CMS): replacement administrator sign-in
  succeeded; all 16 configured collection create screens opened and exposed
  their save/publish controls; a clearly marked temporary Page was created,
  saved as a draft, published (Versions=2), then deleted through the admin
  confirmation dialog. This confirms the authenticated editorial UI and its
  cleanup path without leaving demonstration content behind.

## Notes and follow-ups

- Filtered pnpm installs prune sibling workspace node_modules; always run
  full `pnpm install` in this repo.
- CMS admin dev-mode has a known upstream chunk issue; use production build
  (`next build && next start`) for local admin work.
- Publishing/scheduled publishing UI controls come from Payload versions;
  scheduled publish lands with Phase 08 workflow work if needed.
- Public live preview is intentionally not configured here: Phase 07 wires
  CMS preview and published-content rendering into the public web app.
