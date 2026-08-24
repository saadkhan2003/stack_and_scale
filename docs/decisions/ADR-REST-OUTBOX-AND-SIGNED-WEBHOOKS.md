# ADR — Versioned REST, Transactional Outbox and Signed Webhooks

**Status:** Accepted for Phase 03

## Context

First-party surfaces and future product/partner integrations need stable synchronous APIs and reliable asynchronous notifications. Provider failures and duplicate delivery are normal operating conditions.

## Decision

Use versioned REST/OpenAPI for synchronous interaction, a transactional outbox for domain-event delivery, and HMAC-signed timestamped webhooks for external notifications. Commands that can be retried use idempotency keys; consumers tolerate duplicates.

## Alternatives considered

- **Direct synchronous provider calls in domain transactions:** simple initially, but loses events or blocks user actions during provider failure.
- **A public GraphQL/developer platform from V1:** flexible, but beyond current product and budget needs.

## Consequences

- Workers, DLQs, replay logs and endpoint ownership are part of the implementation requirement.
- API and event schemas are versioned contracts, not internal implementation details.
- Private integrations can mature into a public developer platform without replacing the core transport rules.
