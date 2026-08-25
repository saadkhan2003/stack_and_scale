# Phase 06 — CMS and Content Platform

## Outcome

Deliver a secure Payload CMS with structured models, controlled visual blocks, editorial workflow, media handling and stable content contracts for the public website.

## Execution profile

- **Model tier:** strongest for schema/workflow design; default for collection and block implementation
- **Mode:** partially parallel with Phase 05 after Phase 04 contracts freeze
- **External-platform spend:** $0 licence cost
- **Depends on:** Phases 02 and 04
- **Unlocks:** Phases 07 and 08

## Work packages

### 06.1 Payload foundation

- Install a currently compatible Payload/Next.js/PostgreSQL combination.
- Separate CMS routes and deployment responsibility from the public web app.
- Validate configuration and secrets.
- Establish migration and generated-type workflow.

### 06.2 Core collections

- pages;
- products and product features/plans;
- services;
- industries;
- projects and case studies;
- resources and authors;
- team, testimonials and clients;
- careers, FAQs, redirects, navigation and site settings;
- media.

### 06.3 Relationship model

- Product/service/industry/work/resource links.
- Related-content rules.
- Featured-content selection.
- Referential-integrity and deletion behavior.

### 06.4 Controlled visual blocks

- Hero variants.
- Rich text.
- Feature, metric and testimonial groups.
- Media/gallery/video.
- Product interface showcase.
- Process, FAQ, related content and CTA.

Block schemas must follow Phase 02 design contracts.

### 06.5 Editorial workflow

- Invite-only CMS users.
- Administrator, publisher, editor, author and media roles.
- Draft, review, approval, schedule, publish and rollback.
- Version history and preview links.

### 06.6 Media workflow

- Image dimensions, formats, alt text and focal points.
- Private versus public assets.
- File type/size restrictions.
- Storage adapter and lifecycle rules.

### 06.7 Content contract tests

- Required SEO fields and unique slugs.
- Relationship integrity.
- Rendering fixtures for minimal, typical and extreme content.
- Role and workflow authorization.

## Exit criteria

- An editor can create, preview, approve and publish each core record type.
- Generated CMS types compile in the consuming web application.
- Blocks cannot violate core layout contracts.
- Media includes accessibility metadata and safe access policy.
- Publishing produces auditable versions.
- No public signup exists for CMS users.

## Rollback and recovery

Use versioned schema migrations and preserve content exports. Roll back block rendering independently from stored content whenever possible.

## Cold-start handoff

Read Questions 7–10, 19, 22, 24, 61, 63, 64 and 75–77. Editors own content; code owns the visual system.
