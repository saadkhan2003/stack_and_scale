# Phase 06 Orchestration — CMS Content Platform

Date: 2026-08-25. Base scaffold (payload.config.ts, app routes, tsconfig,
next.config.mjs, cms-users access, media collection) is owned by the
orchestrator. Agents own ONLY their listed files.

## Shared contracts

- Collection pattern: follow apps/cms/src/collections/media.ts (access by
  cms-users session, admin.group, required SEO fields where relevant).
- Roles: administrator/publisher/editor/author from src/access/cms-users.ts.
- Blocks registry: src/blocks/index.ts exports `allBlocks`; pages import it.
- Slugs unique per collection; drafts enabled on public-facing collections;
  versions maxPerDocument 25 on workflowed collections.
- No comments; prettier clean; do NOT edit payload.config.ts or other
  agents' files.

## Workstreams

| #   | ID                    | Files owned                                                   |
| --- | --------------------- | ------------------------------------------------------------- |
| A   | structure-collections | src/collections/{pages,navigation,site-settings,redirects}.ts |
| B   | offer-collections     | src/collections/{products,services,industries}.ts             |
| C   | proof-collections     | src/collections/{projects,resources,authors}.ts               |
| D   | social-collections    | src/collections/{team,testimonials,clients,careers,faqs}.ts   |
| E   | visual-blocks         | src/blocks/\*.ts incl index.ts registry                       |
| F   | contract-tests        | test/content-contracts.test.ts                                |

Integration (orchestrator): register everything in payload.config.ts,
generate types, boot check, migrations, evidence + commits.
