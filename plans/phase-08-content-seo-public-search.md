# Phase 08 — Content, SEO and Public Search

## Outcome

Make the public platform discoverable, indexable and useful through structured SEO, a connected authority resource center, controlled analytics and dependable public search.

## Execution profile

- **Model tier:** strongest for information/SEO architecture; default for implementation
- **Mode:** parallel with Phase 09 after Phase 07 contracts stabilize
- **External-platform spend:** $0
- **Depends on:** Phases 06 and 07
- **Unlocks:** Phase 12

## Work packages

### 08.1 Technical SEO

- Dynamic title, description, canonical and Open Graph data.
- Schema.org types for organization, product, service, article, breadcrumb and FAQ where valid.
- XML sitemaps, robots controls and indexing policy.
- Redirect management and broken-link detection.
- Stable slugs and URL-change workflow.
- Search Console ownership verification, sitemap submission and index-coverage monitoring using the selected search engine's free webmaster tooling.

### 08.2 Authority resource center

- Guides, insights, tutorials and case studies.
- Category, industry, author and related-record navigation.
- Reading time, publish date, structured content and contextual CTA.
- Future extension points for reports, documentation and downloads without implementing them.

### 08.3 Local and international discovery

- Separate intent mapping for Pakistani product buyers and international engineering buyers.
- Avoid doorway pages and duplicated city/industry content.
- Define initial keyword/topic map based on actual offerings.
- Add location/business structured data only when accurate.

### 08.4 Public search

- Begin with PostgreSQL-backed or build-time indexed search.
- Search only published, indexable content.
- Support products, services, work and resources.
- Provide keyboard-accessible command-style discovery.
- Do not add semantic/AI search.

### 08.5 Analytics and consent

- Define event names before instrumentation.
- Track page/product/resource interest, CTA, form start, form success, booking and WhatsApp handoff.
- Add consent and deletion behavior.
- Prefer self-hosted Umami or another approved zero-cost option.
- Never send form content, secrets or unnecessary personal data to analytics.
- Define anonymous-to-known identity transition rules; do not retroactively identify browsing history without an approved purpose and consent basis.
- Add privacy-request deletion propagation and evidence from the Phase 04 orchestration.
- Collect privacy-safe real-user performance measurements for agreed Core Web Vitals within explicit retention and sampling limits.

### 08.6 Search quality checks

- Crawl production-like output.
- Validate canonicals, sitemaps, structured data and redirects.
- Check empty/no-result search states.
- Confirm analytics honors consent state.

## Exit criteria

- Every indexable page has valid metadata and canonical behavior.
- Sitemaps include only publishable routes.
- Resource relationships and contextual CTAs work.
- Public search is fast, accessible and deterministic.
- Analytics events match the documented taxonomy.
- No paid SEO/search platform is required.
- Search indexing status and real-user performance have owned monitoring and alert thresholds.

## Rollback and recovery

Search and analytics adapters must be removable without breaking content routes. Invalid schema or indexing changes are reverted immediately through configuration/content rollback.

## Cold-start handoff

Read Questions 10, 22–25, 66, 70, 87 and 93–95. Traffic without qualified business relevance is not a success metric.
