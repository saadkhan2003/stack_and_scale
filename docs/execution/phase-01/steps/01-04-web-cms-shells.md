# 01-04 — Public Web and CMS Shells

## Outcome

Provide minimal Next.js web and CMS shells with health pages, no business UI or content model, and browser/accessibility test harnesses.

## Inputs

01-01/01-02 outputs; Q061–Q062, Q068–Q069, Q075–Q077.

## Ownership

Own `apps/web`, `apps/cms`, `packages/ui`. Do not implement brand design, Payload collections, real assets, lead forms or production content.

## Actions

Write executable RED browser/component tests for health page content and landmarks, then implement minimal pages to GREEN. CMS may expose an explicitly unconfigured admin placeholder only.

## Compatibility, cost and rollback

No schema/content impact and $0 cost. Revert each shell independently while preserving shared configuration.

## Verification and evidence

Run browser/accessibility smoke tests, typecheck and builds. Evidence: `docs/evidence/phase-01/01-04/`.

## Merge order

After 01-02; may run beside 01-03 with no shared writes.

