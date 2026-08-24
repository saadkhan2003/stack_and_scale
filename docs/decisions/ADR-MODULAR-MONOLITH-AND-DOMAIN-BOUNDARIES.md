# ADR — Modular Monolith and Domain Boundaries

**Status:** Accepted for Phase 03

## Context

The initial company platform needs CRM, content, portal, product-control-plane and commercial capability, but the initial budget and team do not justify operating separate microservices for each concern.

## Decision

Use a NestJS modular monolith with domain-owned persistence interfaces and schemas. Independently deployable surfaces use versioned APIs. Cross-domain behavior goes through application APIs, read projections or events, never arbitrary table access.

## Alternatives considered

- **One unstructured application:** lower initial ceremony, but unacceptable coupling and unsafe table access.
- **Microservices from V1:** independent scaling, but excessive operational and consistency cost for the initial platform.

## Consequences

- Modules can later be extracted when evidence justifies it because their API/event boundaries already exist.
- Developers must maintain dependency and ownership discipline rather than using direct database joins as a shortcut.
- Contract, authorization and event tests become required release evidence.
